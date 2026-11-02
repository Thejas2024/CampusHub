import React, { useEffect, useMemo, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Code2,
  FileCode2,
  LoaderCircle,
  Moon,
  Play,
  RotateCcw,
  Send,
  Sun,
  Terminal,
} from 'lucide-react'
import { codingQuestions, languageLibraries, languageTemplates } from './coding.jsx'
import './CodePractic.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const languages = [
  { id: 'cpp', label: 'C++17', editorId: 'cpp' },
  { id: 'java', label: 'Java', editorId: 'java' },
  { id: 'python', label: 'Python 3', editorId: 'python' },
  { id: 'javascript', label: 'JavaScript (Node.js)', editorId: 'javascript' },
]
const difficultyOrder = ['Easy', 'Medium', 'Hard']

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    const body = await response.text()
    if (/^\s*<!doctype html|^\s*<html/i.test(body)) {
      throw new Error(
        `The code API returned an HTML page (HTTP ${response.status}), not JSON. ` +
        'The backend on port 5000 may be outdated or VITE_API_URL may point to the frontend. ' +
        'Restart src/server with the updated code and verify its API URL.'
      )
    }
    throw new Error(`The code API returned an unexpected response (HTTP ${response.status}).`)
  }

  try {
    return await response.json()
  } catch {
    throw new Error('The code API returned malformed JSON. Check the backend logs and try again.')
  }
}

function getSavedCode(challengeId, language) {
  return localStorage.getItem(`campushub-code-${challengeId}-${language}`)
}

function CodePractic() {
  const [difficulty, setDifficulty] = useState('Easy')
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const requestedChallenge = searchParams.get('challenge')
  const initialChallenge = codingQuestions.find((question) => question.id === requestedChallenge)
    || codingQuestions[0]
  const [challengeId, setChallengeId] = useState(initialChallenge.id)
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(languageTemplates.javascript)
  const [activeTab, setActiveTab] = useState('description')
  const [resultTab, setResultTab] = useState('examples')
  const [execution, setExecution] = useState(null)
  const [executionMode, setExecutionMode] = useState('')
  const [error, setError] = useState('')
  const [runnerAvailable, setRunnerAvailable] = useState(null)
  const [showLibraries, setShowLibraries] = useState(true)
  const [lightMode, setLightMode] = useState(
    () => localStorage.getItem('campushub-code-theme') !== 'dark'
  )
  const completionProviders = useRef([])
  const runCodeRef = useRef(null)

  useEffect(() => {
    const challenge = codingQuestions.find((question) => question.id === requestedChallenge)
    if (challenge) {
      setChallengeId(challenge.id)
      setDifficulty(challenge.difficulty)
    }
  }, [requestedChallenge])

  useEffect(() => () => {
    completionProviders.current.forEach((provider) => provider.dispose())
  }, [])

  const visibleQuestions = useMemo(
    () => codingQuestions.filter((question) => question.difficulty === difficulty),
    [difficulty]
  )
  const selectedQuestion = codingQuestions.find((question) => question.id === challengeId)
  const languageConfig = languages.find((item) => item.id === language)

  useEffect(() => {
    let active = true
    fetch(`${API_URL}/api/code/health`)
      .then(async (response) => {
        const data = await readApiResponse(response)
        if (!response.ok) throw new Error(data.message || 'Unable to check the code runner.')
        return data
      })
      .then((data) => {
        if (active) setRunnerAvailable(data.configured)
      })
      .catch(() => {
        if (active) setRunnerAvailable(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const savedCode = getSavedCode(challengeId, language)
    setCode(savedCode ?? languageTemplates[language])
    setExecution(null)
    setError('')
  }, [challengeId, language])

  const selectDifficulty = (nextDifficulty) => {
    setDifficulty(nextDifficulty)
    const firstQuestion = codingQuestions.find(
      (question) => question.difficulty === nextDifficulty
    )
    setChallengeId(firstQuestion.id)
    setSearchParams({ challenge: firstQuestion.id })
  }

  const updateCode = (value = '') => {
    if (value.length > 8000) {
      setError('Code is limited to 8,000 characters.')
      return
    }
    setCode(value)
    setExecution(null)
    try {
      localStorage.setItem(`campushub-code-${challengeId}-${language}`, value)
    } catch {
      setError('Code is available for this session, but could not be saved in this browser.')
    }
  }

  const runCode = async (mode) => {
    if (!code.trim()) {
      setError('Write a solution before running your code.')
      return
    }

    setExecutionMode(mode)
    setExecution(null)
    setError('')
    setResultTab('results')

    try {
      const response = await fetch(`${API_URL}/api/code/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          language,
          sourceCode: code,
          mode,
        }),
      })
      const data = await readApiResponse(response)
      if (!response.ok) {
        throw new Error(data.message || 'Code execution failed.')
      }

      setExecution(data)
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'Could not reach the code runner. Start the CampusHub server and configure Judge0.'
          : requestError.message
      )
    } finally {
      setExecutionMode('')
    }
  }
  runCodeRef.current = runCode

  const resetCode = () => {
    updateCode(languageTemplates[language])
  }

  const toggleTheme = () => {
    const next = !lightMode
    setLightMode(next)
    try {
      localStorage.setItem('campushub-code-theme', next ? 'light' : 'dark')
    } catch {
      setError('Theme changed for this session, but could not be saved in this browser.')
    }
  }

  const onEditorMount = (editor, monaco) => {
    const suggestions = {
      cpp: [
        ['vector', 'vector<int> values;'],
        ['unordered_map', 'unordered_map<int, int> counts;'],
        ['sort', 'sort(values.begin(), values.end());'],
        ['fori', 'for (int i = 0; i < n; ++i) {\\n    $0\\n}'],
      ],
      java: [
        ['HashMap', 'HashMap<Integer, Integer> counts = new HashMap<>();'],
        ['ArrayList', 'ArrayList<Integer> values = new ArrayList<>();'],
        ['sort', 'Arrays.sort(values);'],
        ['fori', 'for (int i = 0; i < n; i++) {\\n    $0\\n}'],
      ],
      python: [
        ['Counter', 'Counter(values)'],
        ['deque', 'deque()'],
        ['defaultdict', 'defaultdict(list)'],
        ['comprehension', '[value for value in values if condition]'],
      ],
      javascript: [
        ['Map', 'const counts = new Map();'],
        ['Set', 'const seen = new Set();'],
        ['sort', 'values.sort((a, b) => a - b);'],
        ['reduce', 'values.reduce((total, value) => total + value, 0)'],
      ],
    }

    completionProviders.current = Object.entries(suggestions).map(([languageId, items]) =>
      monaco.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems() {
          return {
            suggestions: items.map(([label, insertText]) => ({
              label,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: `Standard ${languageId} coding helper`,
            })),
          }
        },
      })
    )

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCodeRef.current?.('run')
    })
  }

  const testResults = execution?.results || []

  return (
    <main className={`code-practice-shell ${lightMode ? 'light' : ''}`}>
      <header className="code-practice-header">
        <div className="code-practice-brand">
          <span><Code2 size={20} /></span>
          <div><strong>CampusHub Code</strong><small>Practice workspace</small></div>
        </div>
        <button
          type="button"
          className="code-back-to-questions"
          onClick={() => navigate('/portal/code-practice')}
        >
          <ArrowLeft size={15} /> Back to home
        </button>
        <button
          type="button"
          className="code-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${lightMode ? 'dark' : 'light'} mode`}
          title={`Switch to ${lightMode ? 'dark' : 'light'} mode`}
        >
          {lightMode ? <Moon size={15} /> : <Sun size={15} />}
          {lightMode ? 'Dark mode' : 'Light mode'}
        </button>
        <div className="code-practice-status">
          <span className={`runner-dot ${runnerAvailable ? 'online' : ''}`} />
          {runnerAvailable === null
            ? 'Checking runner'
            : runnerAvailable
              ? 'Judge0 runner ready'
              : 'Runner needs configuration'}
        </div>
      </header>

      <div className="code-practice-toolbar">
        <div className="difficulty-tabs" role="tablist" aria-label="Question difficulty">
          {difficultyOrder.map((level) => (
            <button
              key={level}
              type="button"
              role="tab"
              aria-selected={difficulty === level}
              className={difficulty === level ? 'active' : ''}
              onClick={() => selectDifficulty(level)}
            >
              {level}
              <span>{codingQuestions.filter((question) => question.difficulty === level).length}</span>
            </button>
          ))}
        </div>
        <label className="code-question-select">
          <FileCode2 size={16} />
          <select
            value={challengeId}
            onChange={(event) => {
              const nextChallenge = codingQuestions.find(
                (question) => question.id === event.target.value
              )
              if (!nextChallenge) return
              setChallengeId(nextChallenge.id)
              setDifficulty(nextChallenge.difficulty)
              setSearchParams({ challenge: nextChallenge.id })
            }}
            aria-label="Select a coding question"
          >
            {visibleQuestions.map((question, index) => (
              <option key={question.id} value={question.id}>
                {index + 1}. {question.title}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
      </div>

      <div className="code-practice-workspace">
        <section className="code-problem-panel">
          <div className="code-panel-tabs">
            <button
              type="button"
              className={activeTab === 'description' ? 'selected' : ''}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              type="button"
              className={activeTab === 'libraries' ? 'selected' : ''}
              onClick={() => setActiveTab('libraries')}
            >
              Libraries
            </button>
          </div>

          {activeTab === 'description' ? (
            <div className="code-problem-content">
              <div className="code-problem-title">
                <h1>{selectedQuestion.title}</h1>
                <span className={`difficulty-badge ${difficulty.toLowerCase()}`}>
                  {difficulty}
                </span>
              </div>
              <div className="code-topic-list">
                {selectedQuestion.topics.map((topic) => <span key={topic}>{topic}</span>)}
              </div>
              <p>{selectedQuestion.description}</p>
              <h2>Input format</h2>
              <p>{selectedQuestion.inputFormat}</p>
              <h2>Output format</h2>
              <p>{selectedQuestion.outputFormat}</p>
              <h2>Constraints</h2>
              <p><code>{selectedQuestion.constraints}</code></p>
              <h2>Examples</h2>
              {selectedQuestion.examples.map((example, index) => (
                <div className="code-example" key={`${selectedQuestion.id}-${index}`}>
                  <strong>Example {index + 1}</strong>
                  <div><span>Input</span><pre>{example.input}</pre></div>
                  <div><span>Output</span><pre>{example.output}</pre></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="code-problem-content">
              <h1>Standard library quick guide</h1>
              <p>These built-in tools are available in the selected language. Start typing in the editor for code snippets and autocomplete.</p>
              <ul className="code-library-list">
                {languageLibraries[language].map((library) => (
                  <li key={library}><CheckCircle2 size={15} />{library}</li>
                ))}
              </ul>
              <div className="code-editor-note">
                <strong>Input and output</strong>
                <p>Read the complete input from standard input (stdin) and print only your answer to standard output (stdout).</p>
              </div>
            </div>
          )}
        </section>

        <section className="code-editor-panel">
          <div className="code-editor-toolbar">
            <label>
              <Code2 size={15} />
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                {languages.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <button type="button" onClick={resetCode} title="Reset starter code">
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <div className="monaco-editor-wrap">
            <Editor
              height="100%"
              language={languageConfig.editorId}
              theme={lightMode ? 'vs' : 'vs-dark'}
              value={code}
              onChange={updateCode}
              onMount={onEditorMount}
              options={{
                automaticLayout: true,
                fontSize: 14,
                fontFamily: 'Consolas, "Courier New", monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                tabSize: 4,
                wordWrap: 'on',
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                padding: { top: 16 },
              }}
            />
          </div>

          <div className="code-library-bar">
            <button type="button" onClick={() => setShowLibraries((shown) => !shown)}>
              Libraries & autocomplete <ChevronDown size={14} className={showLibraries ? 'rotated' : ''} />
            </button>
            {showLibraries && (
              <div className="code-library-chips">
                {languageLibraries[language].map((library) => (
                  <span key={library}>{library}</span>
                ))}
              </div>
            )}
          </div>

          <div className="code-results-panel">
            <div className="code-results-header">
              <div className="code-results-tabs">
                <button
                  type="button"
                  className={resultTab === 'examples' ? 'selected' : ''}
                  onClick={() => setResultTab('examples')}
                >
                  <Terminal size={14} /> Test cases
                </button>
                <button
                  type="button"
                  className={resultTab === 'results' ? 'selected' : ''}
                  onClick={() => setResultTab('results')}
                >
                  <FileCode2 size={14} /> Results
                </button>
              </div>
              <span>Ctrl + Enter to run</span>
            </div>

            {resultTab === 'examples' ? (
              <div className="code-sample-cases">
                {selectedQuestion.examples.map((example, index) => (
                  <div key={`${selectedQuestion.id}-sample-${index}`}>
                    <strong>Case {index + 1}</strong>
                    <span>Input: <code>{example.input.replaceAll('\n', ' ↵ ')}</code></span>
                    <span>Expected: <code>{example.output}</code></span>
                  </div>
                ))}
              </div>
            ) : execution ? (
              <div className="code-run-results">
                <div className={`code-verdict ${execution.allPassed ? 'accepted' : 'failed'}`}>
                  {execution.allPassed ? <CheckCircle2 size={17} /> : <CircleAlert size={17} />}
                  {execution.allPassed ? 'All test cases passed' : 'Some test cases failed'}
                  <strong>{execution.passed}/{execution.total} passed</strong>
                </div>
                {testResults.map((result, index) => (
                  <div className="code-test-result" key={`${challengeId}-result-${index}`}>
                    <span className={result.passed ? 'passed' : 'failed'}>
                      {result.passed ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
                      Test case {index + 1}
                    </span>
                    <strong>{result.status}</strong>
                    {result.output && <pre>{result.output}</pre>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="code-results-placeholder">
                Run your code to see output and testcase results here.
              </p>
            )}
            {error && <p className="code-execution-error" role="alert">{error}</p>}
          </div>

          <div className="code-action-bar">
            <span>{code.length.toLocaleString()} characters</span>
            <div>
              <button
                type="button"
                className="code-run-button"
                disabled={Boolean(executionMode)}
                onClick={() => runCode('run')}
              >
                {executionMode === 'run' ? <LoaderCircle className="spin" size={15} /> : <Play size={15} />}
                Run code
              </button>
              <button
                type="button"
                className="code-submit-button"
                disabled={Boolean(executionMode)}
                onClick={() => runCode('submit')}
              >
                {executionMode === 'submit' ? <LoaderCircle className="spin" size={15} /> : <Send size={15} />}
                Submit
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default CodePractic

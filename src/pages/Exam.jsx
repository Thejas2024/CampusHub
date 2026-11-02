
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { courses, javascriptQuestions } from "../data/demoData.js";
import { courseExams } from "../data/courseExams.js";
import {
  getCourseProgressPercent,
  readCourseProgress,
} from "../utils/courseProgress.js";
import {
  getAssessmentGrade,
  saveCourseAssessmentResult,
} from "../utils/courseAssessmentResults.js";

const PASS_PERCENTAGE = 40;

const shuffle = (array) => {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const createQuestions = (questionSet) =>
  shuffle(
    questionSet.map((question) => {
      const options = shuffle(
        question.options.map((text, originalIndex) => ({
          text,
          originalIndex
        }))
      );

      return {
        ...question,
        options,
        correctAnswer: options.findIndex(
          (option) => option.originalIndex === question.correctAnswer
        )
      };
    })
  );

const formatTime = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;

const getCourseAccess = (courseId, isCourseAssessment) => {
  if (!isCourseAssessment) return { allowed: true, progress: 100, error: "" };

  try {
    const records = readCourseProgress();
    const progress = getCourseProgressPercent(records[String(courseId)] || {});
    return {
      allowed: progress >= 50,
      progress,
      error: "",
    };
  } catch {
    return {
      allowed: false,
      progress: 0,
      error: "Unable to verify course progress in this browser.",
    };
  }
};

export default function Exam() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseIdParam = searchParams.get("course");
  const courseId = courseIdParam ? Number(courseIdParam) : null;
  const assessment = courseExams[courseId];
  const isCourseAssessment = Boolean(assessment);
  const invalidCourseAssessment = courseIdParam !== null && !assessment;
  const examQuestions = assessment?.questions || javascriptQuestions;
  const examTitle = assessment?.title || "JavaScript Fundamentals";
  const examDuration = (assessment?.durationMinutes || 30) * 60;
  const [questions, setQuestions] = useState(() => createQuestions(examQuestions));
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marked, setMarked] = useState([]);
  const [timeLeft, setTimeLeft] = useState(examDuration);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [resultSaveError, setResultSaveError] = useState("");
  const [courseAccess, setCourseAccess] = useState(() =>
    getCourseAccess(courseId, isCourseAssessment)
  );
  const completionSaved = useRef(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("campushub-exam-history")) || [];
    } catch {
      return [];
    }
  });

  const question = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = total - answeredCount;

  useEffect(() => {
    const refreshAccess = () => {
      setCourseAccess(getCourseAccess(courseId, isCourseAssessment));
    };

    refreshAccess();
    window.addEventListener("storage", refreshAccess);
    window.addEventListener("campushub-course-progress-updated", refreshAccess);
    return () => {
      window.removeEventListener("storage", refreshAccess);
      window.removeEventListener("campushub-course-progress-updated", refreshAccess);
    };
  }, [courseId, isCourseAssessment]);

  useEffect(() => {
    setQuestions(createQuestions(examQuestions));
    setAnswers({});
    setCurrentIndex(0);
    setMarked([]);
    setTimeLeft(examDuration);
    setStarted(false);
    setCompleted(false);
    setShowConfirm(false);
    setResultSaveError("");
    completionSaved.current = false;
  }, [courseIdParam]);

  const results = useMemo(() => {
    const correct = questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;

    const incorrect = answeredCount - correct;

    return {
      correct,
      incorrect,
      unanswered: total - answeredCount,
      percentage: total ? Math.round((correct / total) * 100) : 0
    };
  }, [questions, answers, answeredCount, total]);

  const finishExam = useCallback(() => {
    setStarted(false);
    setCompleted(true);
    setShowConfirm(false);
  }, []);

  useEffect(() => {
    if (!started || completed) return;

    const interval = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          finishExam();
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, completed, finishExam]);

  useEffect(() => {
    if (!completed || completionSaved.current) return;
    completionSaved.current = true;

    const record = {
      subject: examTitle,
      courseId: isCourseAssessment ? courseId : null,
      date: new Date().toLocaleString(),
      score: results.correct,
      total,
      percentage: results.percentage,
      grade: getAssessmentGrade(results.percentage),
      timeTaken: examDuration - timeLeft,
    };

    try {
      if (isCourseAssessment) {
        saveCourseAssessmentResult(courseId, record);
      }

      const updatedHistory = [record, ...history].slice(0, 10);
      localStorage.setItem(
        "campushub-exam-history",
        JSON.stringify(updatedHistory)
      );
      setHistory(updatedHistory);
      setResultSaveError("");
    } catch {
      setResultSaveError("Your score could not be saved in this browser.");
    }
  }, [completed]);

  const selectAnswer = (optionIndex) => {
    setAnswers((previous) => ({
      ...previous,
      [question.id]: optionIndex
    }));
  };

  const goTo = (index) => {
    setCurrentIndex(index);
  };

  const toggleMark = () => {
    setMarked((previous) =>
      previous.includes(question.id)
        ? previous.filter((id) => id !== question.id)
        : [...previous, question.id]
    );
  };

  const startExam = () => {
    if (isCourseAssessment && !courseAccess.allowed) return;
    setQuestions(createQuestions(examQuestions));
    setAnswers({});
    setCurrentIndex(0);
    setMarked([]);
    setTimeLeft(examDuration);
    setCompleted(false);
    setShowConfirm(false);
    setResultSaveError("");
    completionSaved.current = false;
    setStarted(true);
  };

  const submitAndNext = () => {
    if (currentIndex === total - 1) {
      setShowConfirm(true);
    } else {
      goTo(currentIndex + 1);
    }
  };

  const exportResults = () => {
    const content = [
      `CampusHub - ${examTitle} Results`,
      `Score: ${results.correct}/${total}`,
      `Percentage: ${results.percentage}%`,
      `Correct: ${results.correct}`,
      `Incorrect: ${results.incorrect}`,
      `Unanswered: ${results.unanswered}`,
      "",
      ...questions.map((q, index) => {
        const answer = answers[q.id];

        return [
          `${index + 1}. ${q.question}`,
          `Your answer: ${answer === undefined ? "Skipped" : q.options[answer].text}`,
          `Correct answer: ${q.options[q.correctAnswer].text}`,
          `Explanation: ${q.explanation}`
        ].join("\n");
      })
    ].join("\n\n");

    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `${examTitle.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase()}-results.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const bg = darkMode
    ? "bg-slate-950 text-slate-100"
    : "bg-orange-50 text-slate-800";

  const panel = darkMode
    ? "border-slate-800 bg-slate-900 shadow-xl shadow-black/10"
    : "border-orange-100 bg-white shadow-sm shadow-orange-100/60";

  const muted = darkMode ? "text-slate-400" : "text-slate-500";

  if (!total) {
    return <div className="p-8">No questions available.</div>;
  }

  if (invalidCourseAssessment) {
    return (
      <main className={`flex min-h-screen items-center justify-center p-5 ${bg}`}>
        <section className={`w-full max-w-xl rounded-3xl border p-8 ${panel}`}>
          <h1 className="text-2xl font-bold">Assessment not found</h1>
          <p className={`mt-3 ${muted}`}>This course assessment does not exist.</p>
          <button
            onClick={() => navigate("/portal/tests")}
            className="mt-6 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white"
          >
            Back to tests
          </button>
        </section>
      </main>
    );
  }

  if (isCourseAssessment && !courseAccess.allowed) {
    return (
      <main className={`flex min-h-screen items-center justify-center p-5 ${bg}`}>
        <section className={`w-full max-w-xl rounded-3xl border p-8 ${panel}`}>
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Course assessment locked
          </p>
          <h1 className="mt-3 text-3xl font-bold">{examTitle}</h1>
          <p className={`mt-3 ${muted}`}>
            Watch at least 50% of the course video to unlock this test.
            Current progress: {courseAccess.progress}%.
          </p>
          {courseAccess.error && (
            <p role="alert" className="mt-3 text-sm text-red-500">
              {courseAccess.error}
            </p>
          )}
          <button
            onClick={() => navigate(`/LearnLms?course=${courseId}`)}
            className="mt-6 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white"
          >
            Continue course
          </button>
        </section>
      </main>
    );
  }

  if (!started && !completed) {
    return (
      <main className={`flex min-h-screen items-center justify-center p-5 ${bg}`}>
        <section className={`w-full max-w-xl rounded-3xl border p-8 ${panel}`}>
          <div className="mb-6 flex items-center justify-between">
            <span className="font-bold text-orange-600">CampusHub</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg border border-slate-200 px-3 py-2 transition hover:border-orange-300 hover:bg-orange-50"
            >
              {darkMode ? "☀ Light" : "☾ Dark"}
            </button>
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Online Assessment
          </p>
          <h1 className="mt-3 text-3xl font-bold">
            {examTitle}
          </h1>
          <p className={`mt-3 ${muted}`}>
            {isCourseAssessment
              ? "Check your understanding of this course in a timed MCQ exam."
              : "Assess your JavaScript knowledge in a timed MCQ exam."}
          </p>

          <div className="my-7 grid grid-cols-2 gap-4">
            <div className={`rounded-xl p-5 ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
              <p className="text-2xl font-bold">{total}</p>
              <p className={`text-sm ${muted}`}>Questions</p>
            </div>
            <div className={`rounded-xl p-5 ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
              <p className="text-2xl font-bold">{examDuration / 60} min</p>
              <p className={`text-sm ${muted}`}>Duration</p>
            </div>
          </div>

          <ul className={`mb-7 space-y-3 text-sm ${muted}`}>
            <li>✓ Four options for every question</li>
            <li>✓ Navigate between questions and change answers</li>
            <li>✓ Mark questions for review</li>
            <li>✓ Automatic submission when time expires</li>
            <li>✓ Results, explanations, and answer review</li>
            <li>✓ Passing score: {PASS_PERCENTAGE}%</li>
          </ul>
          {resultSaveError && (
            <p role="alert" className="mb-4 text-sm text-red-500">
              {resultSaveError}
            </p>
          )}

          <button
            onClick={startExam}
            className="w-full rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            Start Exam
          </button>

          {history.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold">Recent Attempts</h2>
              {history.slice(0, 3).map((item, index) => (
                <div key={`${item.date}-${index}`} className={`mb-2 rounded-lg p-3 ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
                  <div className="flex justify-between gap-3">
                    <span className="text-sm">{item.date}</span>
                    <strong>{item.percentage}%</strong>
                  </div>
                  <p className={`text-sm ${muted}`}>
                    Score: {item.score}/{item.total}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  if (completed) {
    const passed = results.percentage >= PASS_PERCENTAGE;

    return (
      <main className={`min-h-screen p-4 py-10 sm:p-8 ${bg}`}>
        <section className={`mx-auto max-w-4xl rounded-3xl border p-5 sm:p-9 ${panel}`}>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600">
              ✓
            </div>
            <h1 className="mt-4 text-3xl font-bold">Test Completed!</h1>
            <p className={`mt-2 ${muted}`}>{examTitle}</p>
            <p className="mt-7 text-sm uppercase tracking-wider text-orange-600">
              Final Score
            </p>
            <p className="mt-2 text-5xl font-bold">
              {results.correct}/{total}
            </p>
            <p className="mt-2 text-2xl font-semibold text-orange-600">
              {results.percentage}%
            </p>
            <span className={`mt-3 inline-block rounded-full px-4 py-2 text-sm font-semibold ${passed ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-700"}`}>
              {getAssessmentGrade(results.percentage)} · {passed ? "Passed" : "Needs Improvement"}
            </span>
          </div>

          {resultSaveError && (
            <p role="alert" className="mt-4 text-center text-sm text-red-500">
              {resultSaveError}
            </p>
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              ["Correct", results.correct, "text-emerald-600"],
              ["Incorrect", results.incorrect, "text-red-500"],
              ["Unanswered", results.unanswered, "text-amber-700"]
            ].map(([label, value, color]) => (
              <div key={label} className={`rounded-xl p-5 text-center ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className={`mt-1 text-sm ${muted}`}>{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={exportResults} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold transition hover:border-orange-300 hover:bg-orange-50">
              Download Results
            </button>
            <button onClick={startExam} className="flex-1 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-500">
              Retake Exam
            </button>
            <button
              onClick={() => {
                if (isCourseAssessment) {
                  navigate("/portal/tests");
                } else {
                  setCompleted(false);
                  setStarted(false);
                }
              }}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold transition hover:border-orange-300 hover:bg-orange-50"
            >
              {isCourseAssessment ? "Back to Tests" : "Exam Home"}
            </button>
          </div>

          <h2 className="mb-4 mt-10 text-xl font-bold">Answer Review</h2>

          <div className="space-y-4">
            {questions.map((q, index) => {
              const selected = answers[q.id];
              const correct = selected === q.correctAnswer;

              return (
                <article key={q.id} className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${panel}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {index + 1}. {q.question}
                    </p>
                    <span className={`rounded-full px-3 py-1 text-xs ${selected === undefined ? "bg-amber-500/15 text-amber-700" : correct ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-700"}`}>
                      {selected === undefined ? "Skipped" : correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm ${muted}`}>
                    Your answer: {selected === undefined ? "Not answered" : q.options[selected].text}
                  </p>
                  <p className="mt-2 text-sm text-emerald-600">
                    Correct answer: {q.options[q.correctAnswer].text}
                  </p>
                  <p className={`mt-2 text-sm ${muted}`}>
                    {q.explanation}
                  </p>
                  <span className={`mt-3 inline-block text-xs ${muted}`}>
                    {q.category} · {q.difficulty}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    );
  }

  const selected = answers[question.id];
  const isLast = currentIndex === total - 1;

  return (
    <main className={`min-h-screen px-4 py-6 sm:px-6 ${bg}`}>
      <div className="mx-auto max-w-6xl">
        <header className={`sticky top-0 z-10 mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 shadow-lg shadow-slate-900/5 backdrop-blur ${panel}`}>
          <div>
            <p className="text-sm font-semibold text-orange-600">CampusHub Exam</p>
            <h1 className="mt-1 text-lg font-bold sm:text-xl">
              {examTitle}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg border border-slate-200 px-3 py-2 transition hover:border-orange-300 hover:bg-orange-50 text-sm"
            >
              {darkMode ? "☀" : "☾"}
            </button>
            <div className={`rounded-xl px-4 py-2 text-center ${timeLeft <= 60 ? "bg-red-500/15 text-red-700" : timeLeft <= 300 ? "bg-amber-500/15 text-amber-700" : "bg-orange-500/15 text-orange-700"}`}>
              <p className="text-xs">TIME LEFT</p>
              <p className="text-xl font-bold tabular-nums">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </header>

        {timeLeft <= 300 && (
          <p role="alert" className="mb-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700">
            {timeLeft <= 60 ? "One minute or less remaining!" : "Five minutes or less remaining. Review your answers."}
          </p>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
          <section className={`rounded-2xl border p-5 sm:p-8 shadow-sm ${panel}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold text-orange-600">
                Question {currentIndex + 1} of {total}
              </span>
              <div className="flex gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
                  {question.difficulty}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
                  {question.category}
                </span>
              </div>
            </div>

            <div className={`mt-4 h-2 overflow-hidden rounded-full ${darkMode ? "bg-slate-800" : "bg-orange-100"}`}>
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${(answeredCount / total) * 100}%` }}
              />
            </div>
            <p className={`mt-2 text-xs ${muted}`}>
              {answeredCount} answered · {unansweredCount} remaining
            </p>

            <h2 className="mt-8 text-xl font-bold leading-relaxed sm:text-2xl">
              {question.question}
            </h2>

            <div className="mt-6 space-y-3">
              {question.options.map((option, index) => (
                <label
                  key={`${question.id}-${index}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    selected === index
                      ? "border-orange-500 bg-orange-500/10"
                      : `${darkMode ? "border-slate-700 hover:border-orange-400" : "border-orange-100 hover:border-orange-300"}`
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={selected === index}
                    onChange={() => selectAnswer(index)}
                    className="h-4 w-4 accent-orange-500"
                  />
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option.text}</span>
                </label>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <button
                onClick={() => goTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="rounded-xl border border-slate-200 px-4 py-3 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                onClick={toggleMark}
                className={`rounded-xl border border-slate-200 px-4 py-3 transition hover:border-amber-400 hover:bg-amber-50 ${marked.includes(question.id) ? "border-amber-500 bg-amber-50 text-amber-700" : ""}`}
              >
                {marked.includes(question.id) ? "★ Marked" : "☆ Mark for Review"}
              </button>

              <button
                onClick={() => {
                  if (isLast) setShowConfirm(true);
                  else goTo(currentIndex + 1);
                }}
                className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              >
                {isLast ? "Finish Exam" : "Next →"}
              </button>
            </div>

            <button
              onClick={submitAndNext}
              className="mt-3 w-full rounded-xl border border-orange-500 px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-50"
            >
              {isLast ? "Submit & Finish" : "Submit Answer & Next"}
            </button>
          </section>

          <aside className={`rounded-2xl border p-5 shadow-sm ${panel}`}>
            <h2 className="font-bold">Question Palette</h2>
            <p className={`mt-1 text-sm ${muted}`}>
              Select a number to navigate.
            </p>

            <div className="mt-5 grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = marked.includes(q.id);
                const isCurrent = index === currentIndex;

                let style = darkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-orange-100 bg-orange-50";

                if (isAnswered) style = "border-emerald-500 bg-emerald-500/15 text-emerald-600";
                if (isMarked) style = "border-amber-500 bg-amber-500/15 text-amber-700";
                if (isCurrent) style = "border-orange-500 ring-2 ring-orange-500";

                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(index)}
                    aria-label={`Go to question ${index + 1}${isAnswered ? ", answered" : ", unanswered"}${isMarked ? ", marked for review" : ""}`}
                    aria-current={isCurrent ? "step" : undefined}
                    className={`flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold ${style}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className={`mt-6 space-y-3 text-sm ${muted}`}>
              <p><span className="mr-2 text-emerald-600">●</span>Answered</p>
              <p><span className="mr-2 text-slate-500">●</span>Unanswered</p>
              <p><span className="mr-2 text-amber-700">●</span>Marked for review</p>
              <p><span className="mr-2 text-orange-600">●</span>Current question</p>
            </div>

            <div className={`mt-6 rounded-xl p-4 ${darkMode ? "bg-slate-800" : "bg-orange-50"}`}>
              <p className="text-sm font-semibold">Exam Summary</p>
              <div className={`mt-3 flex justify-between text-sm ${muted}`}>
                <span>Answered</span><span>{answeredCount}</span>
              </div>
              <div className={`mt-2 flex justify-between text-sm ${muted}`}>
                <span>Unanswered</span><span>{unansweredCount}</span>
              </div>
              <div className={`mt-2 flex justify-between text-sm ${muted}`}>
                <span>Marked</span><span>{marked.length}</span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirm(true)}
              className="mt-5 w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            >
              Finish Exam
            </button>
          </aside>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="finish-title"
            className={`w-full max-w-md rounded-2xl border p-6 ${panel}`}
          >
            <h2 id="finish-title" className="text-xl font-bold">
              Submit your exam?
            </h2>
            <p className={`mt-3 ${muted}`}>
              You have answered {answeredCount} of {total} questions.
              {unansweredCount > 0
                ? ` ${unansweredCount} question(s) are unanswered.`
                : " All questions have been answered."}
            </p>
            {marked.length > 0 && (
              <p className="mt-2 text-sm text-amber-700">
                {marked.length} question(s) are marked for review.
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-orange-300 hover:bg-orange-50"
              >
                Continue Exam
              </button>
              <button
                onClick={finishExam}
                className="flex-1 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-500"
              >
                Confirm Submit
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

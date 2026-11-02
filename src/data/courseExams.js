const question = (id, prompt, options, correctAnswer, explanation) => ({
  id,
  question: prompt,
  options,
  correctAnswer,
  explanation,
  category: 'Course assessment',
  difficulty: 'Medium',
})

export const courseExams = {
  1: {
    title: 'Full Stack Web Development Assessment',
    durationMinutes: 15,
    questions: [
      question(101, 'Which HTTP method is commonly used to retrieve a resource?', ['POST', 'GET', 'PATCH', 'DELETE'], 1, 'GET requests retrieve data from a server.'),
      question(102, 'What is the main purpose of a database index?', ['Encrypt all records', 'Speed up data lookup', 'Replace database backups', 'Render a web page'], 1, 'Indexes help databases find matching records more efficiently.'),
      question(103, 'Which status code indicates a successful HTTP request?', ['301', '403', '200', '500'], 2, 'HTTP 200 indicates that a request succeeded.'),
      question(104, 'Where should server-side secrets such as API keys be stored?', ['In public frontend source', 'In a server environment variable', 'In a URL query string', 'In a CSS file'], 1, 'Server environment variables keep secrets out of client code.'),
      question(105, 'What does a REST API use to identify the resource being requested?', ['A URL endpoint', 'A CSS selector', 'A browser cookie only', 'A file extension'], 0, 'REST endpoints identify resources through URLs.'),
    ],
  },
  2: {
    title: 'Java Full Stack Assessment',
    durationMinutes: 15,
    questions: [
      question(201, 'Which keyword is used to define a class in Java?', ['struct', 'class', 'object', 'define'], 1, 'The class keyword declares a Java class.'),
      question(202, 'Which collection does not allow duplicate elements?', ['ArrayList', 'HashSet', 'LinkedList', 'Vector'], 1, 'A Set stores unique elements.'),
      question(203, 'What does JVM stand for?', ['Java Variable Manager', 'Java Virtual Machine', 'Java Version Module', 'Joint Virtual Method'], 1, 'The JVM executes Java bytecode.'),
      question(204, 'Which annotation maps a class to a REST controller in Spring?', ['@RestController', '@EntityOnly', '@Autowired', '@BeanName'], 0, '@RestController marks a Spring class as a web controller whose methods return response bodies.'),
      question(205, 'Which keyword prevents a Java method from being overridden?', ['static', 'private', 'final', 'volatile'], 2, 'A final method cannot be overridden by subclasses.'),
    ],
  },
  3: {
    title: 'Python & Generative AI Assessment',
    durationMinutes: 15,
    questions: [
      question(301, 'Which Python data type stores key-value pairs?', ['tuple', 'set', 'dict', 'str'], 2, 'A dict stores data as key-value pairs.'),
      question(302, 'What does a Python function use to return a value?', ['yield only', 'return', 'break', 'print'], 1, 'The return statement sends a value back to the caller.'),
      question(303, 'What is a common role of an embedding in an AI application?', ['Convert text to a vector representation', 'Compile Python code', 'Encrypt a database', 'Render HTML'], 0, 'Embeddings represent content as vectors for similarity and retrieval tasks.'),
      question(304, 'What is the purpose of a system prompt?', ['Set behavior and context for a model', 'Increase a video frame rate', 'Create a database index', 'Install a Python package'], 0, 'A system prompt provides high-level instructions and context to a model.'),
      question(305, 'Why should generative AI output be validated?', ['Models can produce incorrect or unsupported information', 'Validation makes every output longer', 'Models cannot generate text', 'It disables tokenization'], 0, 'Generated content may be inaccurate and should be checked.'),
    ],
  },
  4: {
    title: 'MERN Stack Development Assessment',
    durationMinutes: 15,
    questions: [
      question(401, 'Which MERN component is a document database?', ['Express', 'React', 'MongoDB', 'Node.js'], 2, 'MongoDB is the document database in the MERN stack.'),
      question(402, 'What is React primarily used to build?', ['User interfaces', 'Database indexes', 'Operating systems', 'HTTP servers only'], 0, 'React is a library for building user interfaces.'),
      question(403, 'Which component handles HTTP routing in a typical MERN backend?', ['Express', 'MongoDB', 'JSX', 'CSS'], 0, 'Express provides routing and middleware for Node.js applications.'),
      question(404, 'What does JSON.parse() do?', ['Converts a JSON string to a JavaScript value', 'Sends an HTTP request', 'Creates a React component', 'Connects to MongoDB'], 0, 'JSON.parse converts valid JSON text into a JavaScript value.'),
      question(405, 'Where should database credentials be kept in a deployed MERN app?', ['In a checked-in React file', 'In server-side environment configuration', 'In a public image', 'In a page title'], 1, 'Database credentials should remain on the server in protected configuration.'),
    ],
  },
  5: {
    title: 'DevOps Fundamentals Assessment',
    durationMinutes: 15,
    questions: [
      question(501, 'What is the main goal of continuous integration?', ['Frequently integrate and validate code changes', 'Avoid automated tests', 'Manually copy files to production', 'Disable version control'], 0, 'Continuous integration frequently merges changes and runs automated checks.'),
      question(502, 'What does CI/CD commonly stand for?', ['Continuous Integration and Continuous Delivery/Deployment', 'Code Inspection and Code Design', 'Central Installation and Cloud Distribution', 'Continuous Infrastructure and Container Design'], 0, 'CI/CD refers to continuous integration and delivery or deployment.'),
      question(503, 'What is infrastructure as code?', ['Managing infrastructure with versioned configuration', 'Writing application documentation only', 'Manually configuring every server', 'A database query language'], 0, 'Infrastructure as code defines and manages infrastructure with machine-readable files.'),
      question(504, 'Why use automated tests in a deployment pipeline?', ['Catch regressions before release', 'Replace source control', 'Skip code review permanently', 'Guarantee zero future bugs'], 0, 'Automated tests provide fast feedback and catch many regressions before deployment.'),
      question(505, 'What is a deployment rollback?', ['Returning to a previous working release', 'Deleting all source code', 'Changing a DNS record to a random value', 'Re-running a unit test'], 0, 'A rollback restores a previously deployed version when a release has problems.'),
    ],
  },
  6: {
    title: 'AWS Cloud Computing Assessment',
    durationMinutes: 15,
    questions: [
      question(601, 'Which AWS service provides virtual servers?', ['Amazon EC2', 'Amazon S3', 'Amazon Route 53', 'AWS IAM'], 0, 'Amazon EC2 provides resizable virtual compute instances.'),
      question(602, 'What is Amazon S3 primarily used for?', ['Object storage', 'Running JavaScript in a browser', 'Managing source branches', 'Creating relational schemas only'], 0, 'Amazon S3 is an object storage service.'),
      question(603, 'Which AWS service manages identities and permissions?', ['IAM', 'CloudFront', 'SQS', 'ECS'], 0, 'AWS Identity and Access Management controls users, roles, and permissions.'),
      question(604, 'What does the principle of least privilege recommend?', ['Grant only permissions needed for a task', 'Give all users administrator access', 'Share one root account', 'Disable access logging'], 0, 'Least privilege limits permissions to what is necessary.'),
      question(605, 'What is an AWS Region?', ['A separate geographic area containing AWS infrastructure', 'A single virtual machine', 'A programming language', 'A user permission'], 0, 'AWS Regions are distinct geographic areas with multiple Availability Zones.'),
    ],
  },
  7: {
    title: 'Docker for Developers Assessment',
    durationMinutes: 15,
    questions: [
      question(701, 'What is a Docker image?', ['A template used to create containers', 'A running database query', 'A virtual network cable', 'A source-control branch'], 0, 'An image packages the filesystem and configuration used to create containers.'),
      question(702, 'What is a Docker container?', ['A running instance of an image', 'A Docker registry account', 'A source map', 'A package manager'], 0, 'A container is an isolated running instance created from an image.'),
      question(703, 'Which file commonly describes how to build a Docker image?', ['Dockerfile', 'package-lock.json', 'README only', 'docker-image.png'], 0, 'A Dockerfile contains instructions for building an image.'),
      question(704, 'What does publishing a container port allow?', ['Expose a container service through a host port', 'Encrypt an image', 'Increase CPU automatically', 'Delete a volume'], 0, 'Port publishing maps a host port to a port inside the container.'),
      question(705, 'Why use a .dockerignore file?', ['Exclude unnecessary files from the build context', 'Store registry passwords', 'Define container health checks', 'Replace the Dockerfile'], 0, 'A .dockerignore file keeps unwanted files out of the build context.'),
    ],
  },
  8: {
    title: 'Kubernetes Essentials Assessment',
    durationMinutes: 15,
    questions: [
      question(801, 'What is the smallest deployable unit in Kubernetes?', ['Pod', 'ClusterIP', 'Namespace', 'IngressClass'], 0, 'A Pod is the smallest deployable unit in Kubernetes.'),
      question(802, 'What does a Kubernetes Deployment manage?', ['Desired replicas and rollout of pods', 'DNS registration only', 'Developer passwords', 'Local source files'], 0, 'Deployments manage desired replicas and update pod versions.'),
      question(803, 'What does a Kubernetes Service provide?', ['A stable network endpoint for a set of pods', 'A Docker image build', 'A persistent developer shell', 'A Git repository'], 0, 'Services provide stable access to matching pods.'),
      question(804, 'What is a Kubernetes namespace useful for?', ['Separating and organizing resources in a cluster', 'Replacing a container image', 'Increasing a pod port number', 'Creating a cloud region'], 0, 'Namespaces organize resources and provide logical separation.'),
      question(805, 'What is a ConfigMap intended to store?', ['Non-sensitive configuration data', 'Encrypted user passwords', 'Container image layers', 'Node hardware'], 0, 'ConfigMaps store non-sensitive configuration separately from container images.'),
    ],
  },
  9: {
    title: 'React.js Development Assessment',
    durationMinutes: 15,
    questions: [
      question(901, 'Which hook is used to add state to a function component?', ['useState', 'useRoute', 'useClass', 'useStyle'], 0, 'useState adds local state to function components.'),
      question(902, 'Why does React use keys when rendering lists?', ['To identify items consistently between renders', 'To encrypt list data', 'To sort every list alphabetically', 'To create CSS classes'], 0, 'Keys help React identify which list items have changed.'),
      question(903, 'What should a React component return?', ['A renderable element or null', 'A database connection', 'A CSS file path only', 'An HTTP status code'], 0, 'A component returns UI elements or null.'),
      question(904, 'When should useEffect cleanup run?', ['Before the effect reruns and when the component unmounts', 'Only after every button click', 'Before the first render', 'Only during server builds'], 0, 'Cleanup releases subscriptions and resources before reruns and on unmount.'),
      question(905, 'What is a controlled input?', ['An input whose value is driven by React state', 'An input with no value', 'A database form only', 'A disabled input'], 0, 'Controlled inputs use React state as the source of truth for their value.'),
    ],
  },
  10: {
    title: 'Node.js & Express Assessment',
    durationMinutes: 15,
    questions: [
      question(1001, 'What is Node.js?', ['A JavaScript runtime outside the browser', 'A relational database', 'A CSS framework', 'A browser extension'], 0, 'Node.js runs JavaScript outside the browser.'),
      question(1002, 'What does Express middleware typically receive?', ['Request, response, and next', 'Only a database URL', 'A CSS selector and callback', 'A React element and key'], 0, 'Express middleware commonly receives req, res, and next arguments.'),
      question(1003, 'Which HTTP status code is appropriate after creating a resource?', ['201', '204', '302', '503'], 0, 'HTTP 201 Created indicates a resource was successfully created.'),
      question(1004, 'Why validate request bodies on the server?', ['Client input cannot be trusted', 'Browsers always send valid data', 'It removes the need for authorization', 'It prevents all network errors'], 0, 'Server-side validation protects application logic from malformed or unexpected input.'),
      question(1005, 'What is the purpose of async/await in Node.js?', ['Write promise-based asynchronous code more clearly', 'Make every operation synchronous', 'Create an HTTP route automatically', 'Encrypt JavaScript files'], 0, 'async/await provides syntax for working with promises.'),
    ],
  },
  11: {
    title: 'SQL & Database Fundamentals Assessment',
    durationMinutes: 15,
    questions: [
      question(1101, 'Which SQL statement retrieves rows from a table?', ['SELECT', 'INSERT', 'UPDATE', 'DROP'], 0, 'SELECT queries retrieve rows from tables.'),
      question(1102, 'What does a primary key do?', ['Uniquely identifies each row', 'Stores only encrypted data', 'Sorts all tables automatically', 'Connects to a cloud region'], 0, 'A primary key uniquely identifies each row in a table.'),
      question(1103, 'Which join returns rows with matching values in both tables?', ['INNER JOIN', 'CROSS JOIN', 'FULL TEXT', 'NO JOIN'], 0, 'INNER JOIN returns rows that match the join condition in both tables.'),
      question(1104, 'What does GROUP BY do?', ['Groups rows for aggregate calculations', 'Deletes duplicate tables', 'Encrypts columns', 'Limits access to a database'], 0, 'GROUP BY groups rows so aggregate functions can calculate per group.'),
      question(1105, 'Why use a parameterized query?', ['Reduce SQL injection risk and handle values safely', 'Make every query return all rows', 'Avoid defining a schema', 'Replace database backups'], 0, 'Parameterized queries separate data values from SQL code.'),
    ],
  },
  12: {
    title: 'Git & GitHub Assessment',
    durationMinutes: 15,
    questions: [
      question(1201, 'Which command creates a new Git commit?', ['git commit', 'git clone', 'git status', 'git fetch'], 0, 'git commit records staged changes in the local repository.'),
      question(1202, 'What does git clone do?', ['Copies a remote repository locally', 'Uploads a commit automatically', 'Deletes a branch', 'Combines two commits'], 0, 'git clone creates a local copy of a remote repository.'),
      question(1203, 'What is a pull request commonly used for?', ['Propose and review changes before merging', 'Encrypt a repository', 'Run a database migration', 'Create a local commit'], 0, 'Pull requests provide a place to discuss and review proposed changes.'),
      question(1204, 'Which command shows the current working tree status?', ['git status', 'git merge', 'git init', 'git tag'], 0, 'git status reports staged, unstaged, and untracked changes.'),
      question(1205, 'What is a Git branch?', ['A movable pointer to a line of development', 'A copy of the GitHub website', 'A permanent backup archive', 'A package registry'], 0, 'A branch is a lightweight pointer that lets work proceed independently.'),
    ],
  },
}

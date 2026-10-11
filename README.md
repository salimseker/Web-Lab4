# Assignment 4 - Task Dashboard

This project is a small task dashboard that runs in the browser, written in plain
HTML, CSS and JavaScript (no frameworks, no libraries). When the **Load Tasks** button
is clicked, it fetches a list of tasks from a simulated (slow) server, turns the raw
data into `Task` objects with a read-only `id`, and draws them on the page. Each task
can be marked as completed / not completed or deleted. The main topics it demonstrates
are **Promises and `async`/`await`**, **ES6 classes**, **object property descriptors**,
**immutable array operations**, **JSON** and **DOM manipulation with events**.

## How to Run

No packages or build tools are needed. Just open `index.html` in a web browser
(double-click it, or drag it into a browser window).

1. Click **Load Tasks**. The message "Loading tasks..." appears.
2. After about 1.5 seconds (the simulated server delay) the three tasks appear.
3. **Toggle** crosses a task out (completed) or un-crosses it.
4. **Delete** removes the task from the list.

## File Organization

- **`index.html`** - The page structure: a heading, the **Load Tasks** button
  (`#loadTasksBtn`), an empty paragraph for status / error messages
  (`#statusMessage`) and an empty container where the tasks are drawn (`#taskList`).
  The three scripts are loaded at the end with `defer`, in this order: `api.js`,
  `taskManager.js`, `main.js`. `defer` makes them run after the HTML is parsed (so
  `getElementById` finds the elements) and still keeps this order, so `main.js` can
  use `fetchTasks`, `Task` and `TaskManager` from the files before it.
- **`styles.css`** - Simple styling. Every task is a white flex row (`.task`) with the
  title on the left and the two buttons on the right. When a task has the
  `completed` class, its title gets `text-decoration: line-through` and a grey color.
- **`api.js`** - Contains `fetchTasks()`, which simulates a request to a server. It
  returns a `Promise` that resolves with an array of three raw task objects after
  `FETCH_DELAY_MS` (1500 ms) using `setTimeout`. The delay is stored in a named
  constant instead of writing `1500` directly in the code.
- **`taskManager.js`** - Contains two classes:
  - `Task` - The constructor takes `id`, `title` and `completed`. The `id` is
    defined with `Object.defineProperty()` using `writable: false` and
    `configurable: false`, so it cannot be changed or deleted after the task is
    created (`enumerable: true` keeps it visible when the object is logged).
    `toggle()` does **not** change the task; it returns a **new** `Task` with the
    same `id` and `title` and the opposite `completed` value.
  - `TaskManager` - Holds the list of tasks in `this.tasks`. Its methods never
    change the existing array with `push` / `splice`; they always build a new array
    and assign it:
    - `setTasks(tasks)` - copies the given array with the spread operator.
    - `addTask(task)` - `[...this.tasks, task]`
    - `removeTask(taskId)` - `filter()` keeps every task except the one with that id.
    - `toggleTask(taskId)` - `map()` replaces the matching task with `task.toggle()`
      and keeps the others as they are.
- **`main.js`** - Connects everything to the page:
  - `loadTasks()` is an `async` function. It shows "Loading tasks...", waits for
    `await fetchTasks()`, converts the data to JSON text with `JSON.stringify()` and
    back with `JSON.parse()` (like a real server response), turns every plain object
    into a `Task` with `map()`, gives them to the `TaskManager` and calls
    `renderTasks()`. Everything is inside `try/catch`: if loading fails, the user sees
    "Failed to load tasks. Please try again." and the details are written to the
    console with `console.error`.
  - `createTaskElement(task)` builds one task row with `document.createElement()`: a
    `<span>` for the title and the **Toggle** / **Delete** buttons, each with its own
    `click` listener.
  - `renderTasks()` empties `#taskList` with `replaceChildren()` and draws every task
    in `taskManager.tasks` again.
  - `handleToggle(taskId)` and `handleDelete(taskId)` update the `TaskManager` and
    then call `renderTasks()` so the page always shows the current state.
- **`README.md`** - This file.

## Testing the Error Message

`fetchTasks()` always succeeds, so the error message never shows up normally. To see
it, I temporarily changed `api.js` so the Promise is rejected:

```js
return new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error("Server is not responding"));
  }, FETCH_DELAY_MS);
});
```

After clicking **Load Tasks**, the page showed "Failed to load tasks. Please try
again." and the console showed `Failed to load tasks: Error: Server is not
responding`. Then I changed the code back.

## Challenges Faced

- **Waiting for the data without freezing the page:** `setTimeout` does not stop the
  program, so the tasks are not ready right after `fetchTasks()` is called. Returning
  a `Promise` from `fetchTasks` and using `await` inside the `async` function
  `loadTasks` let me write the code from top to bottom, like normal code, while the
  page keeps working during the 1.5 second delay.
- **Catching errors from `await`:** when a Promise is rejected, `await` throws the
  error like a normal `throw`. Wrapping the whole loading part in `try/catch` means a
  failed request shows a friendly message to the user instead of an uncaught error in
  the console and a page that says "Loading tasks..." forever.
- **JSON loses the class methods:** `JSON.stringify()` only keeps the data, not the
  methods, so the objects that come out of `JSON.parse()` are plain objects without
  `toggle()`. That is why every parsed object is turned into a real `Task` with
  `new Task(id, title, completed)` before it is stored.
- **Changing a task without mutating it:** at first the easy way was to write
  `task.completed = !task.completed`. To follow the immutability idea, `toggle()`
  returns a new `Task` instead, and `TaskManager` builds new arrays with `map()`,
  `filter()` and the spread operator. The old array and old task objects are never
  changed, so there are no hidden side effects.
- **Keeping the page in sync with the data:** after a toggle or delete, the old DOM
  elements still show the old state. Instead of finding and editing the one element
  that changed, `renderTasks()` clears the list with `replaceChildren()` and draws it
  again from `taskManager.tasks`. This is simple and the page is always correct. The
  old buttons are removed together with their event listeners.
- **Knowing which task a button belongs to:** each button's listener is an arrow
  function, `() => handleToggle(task.id)`, created inside `createTaskElement`. The
  arrow function remembers (closes over) the `task` of that row, so every button
  works on its own task without storing the id in an HTML attribute.
- **`textContent` instead of `innerHTML`:** the task titles come from "the server".
  If they were added with `innerHTML`, a title containing HTML or a `<script>` tag
  would be run by the browser. `createElement()` + `textContent` always shows the
  title as plain text, which is safer.
- **Sharing code between files without modules:** with `type="module"` scripts the
  browser blocks the files when `index.html` is opened directly from disk
  (`file://`), so a local server would be needed. I used normal scripts with `defer`
  instead. They share the same global scope, so the order of the `<script>` tags
  matters: `main.js` must be last because it uses everything from the other two
  files.

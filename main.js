const loadTasksBtn = document.getElementById("loadTasksBtn");
const statusMessage = document.getElementById("statusMessage");
const taskList = document.getElementById("taskList");

const taskManager = new TaskManager();

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  if (task.completed) {
    taskElement.classList.add("completed");
  }

  const title = document.createElement("span");
  title.textContent = task.title;

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "Toggle";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  taskElement.appendChild(title);
  taskElement.appendChild(toggleBtn);
  taskElement.appendChild(deleteBtn);

  return taskElement;
}

function renderTasks() {
  taskList.replaceChildren();

  taskManager.tasks.forEach((task) => {
    taskList.appendChild(createTaskElement(task));
  });
}

async function loadTasks() {
  statusMessage.textContent = "Loading tasks...";

  const rawTasks = await fetchTasks();

  const json = JSON.stringify(rawTasks);
  const parsedTasks = JSON.parse(json);

  const tasks = parsedTasks.map(
    ({ id, title, completed }) => new Task(id, title, completed)
  );

  taskManager.setTasks(tasks);
  renderTasks();
  statusMessage.textContent = "";
}

loadTasksBtn.addEventListener("click", loadTasks);

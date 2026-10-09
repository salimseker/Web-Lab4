const loadTasksBtn = document.getElementById("loadTasksBtn");
const statusMessage = document.getElementById("statusMessage");
const taskList = document.getElementById("taskList");

const taskManager = new TaskManager();

async function loadTasks() {
  statusMessage.textContent = "Loading tasks...";

  const rawTasks = await fetchTasks();

  const json = JSON.stringify(rawTasks);
  const parsedTasks = JSON.parse(json);

  const tasks = parsedTasks.map(
    ({ id, title, completed }) => new Task(id, title, completed)
  );

  taskManager.setTasks(tasks);
  statusMessage.textContent = "";
}

loadTasksBtn.addEventListener("click", loadTasks);

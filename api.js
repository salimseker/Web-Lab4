const FETCH_DELAY_MS = 1500;

function fetchTasks() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, title: "Study JavaScript", completed: false },
        { id: 2, title: "Practice DOM", completed: true },
        { id: 3, title: "Read Async Patterns", completed: false },
      ]);
    }, FETCH_DELAY_MS);
  });
}

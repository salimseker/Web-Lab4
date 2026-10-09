class Task {
  constructor(id, title, completed) {
    Object.defineProperty(this, "id", {
      value: id,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    this.title = title;
    this.completed = completed;
  }

  toggle() {
    return new Task(this.id, this.title, !this.completed);
  }
}

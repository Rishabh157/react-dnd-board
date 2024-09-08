export const initialData = {
  tasks: {
    "task-1": { id: "task-1", content: "Task 1" },
    "task-2": { id: "task-2", content: "Task 2" },
    "task-3": { id: "task-3", content: "Task 3" },
    "task-4": { id: "task-4", content: "Task 4" },
    "task-5": { id: "task-5", content: "Task 5" },
    "task-6": { id: "task-6", content: "Task 6" },
    "task-7": { id: "task-7", content: "Task 7" },
    "task-8": { id: "task-8", content: "Task 8" },
    "task-9": { id: "task-9", content: "Task 9" },
    "task-10": { id: "task-10", content: "Task 10" },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      taskIds: ["task-1", "task-2", "task-3"],
    },
    "column-2": {
      id: "column-2",
      title: "Open",
      taskIds: ["task-4", "task-5", "task-6"],
    },
    "column-3": {
      id: "column-3",
      title: "In Prgoress",
      taskIds: ["task-7", "task-8", "task-9", "task-10"],
    },
  },
};

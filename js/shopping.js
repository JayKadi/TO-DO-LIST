// ---------------- LOAD SHOPPING TASKS ----------------
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // clear lists first
  document.getElementById("todo-list").innerHTML = "";
  document.getElementById("in-progress-list").innerHTML = "";
  document.getElementById("completed-list").innerHTML = "";

  // loop through only shopping tasks
  tasks
    .filter(t => t.category === "shopping")
    .forEach(task => {
      addTaskToBoard(task);
    });
}

// ---------------- ADD TASK TO BOARD ----------------
function addTaskToBoard(task) {
  const li = document.createElement("li");
  li.setAttribute("draggable", "true");
  li.classList.add("task-item", `priority-${task.priority}`);
  li.dataset.category = task.category;

  const span = document.createElement("span");
  span.textContent = task.text;

  span.addEventListener("click", () => {
    span.classList.toggle("completed");
    saveTasks();
  });

  li.appendChild(span);

  // append to correct column
  const listId = `${task.status}-list`;
  const list = document.getElementById(listId);

  if (list) {
    list.appendChild(li);
  } else {
    console.warn(`List not found: ${listId}`);
  }

  enableDragAndDrop(li);
}

// ---------------- DRAG & DROP ----------------
function enableDragAndDrop(li) {
  li.addEventListener("dragstart", () => {
    li.classList.add("dragging");
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");

    // update status in localStorage
    const parentId = li.parentElement.id.replace("-list", "");
    const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];

    allTasks.forEach(t => {
      if (t.text === li.querySelector("span").textContent && t.category === "shopping") {
        t.status = parentId;
      }
    });

    localStorage.setItem("tasks", JSON.stringify(allTasks));
  });
}

document.querySelectorAll(".column ul").forEach(ul => {
  ul.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (dragging) {
      ul.appendChild(dragging);
    }
  });
});

// ---------------- SAVE TASKS ----------------
function saveTasks() {
  const tasks = [];
  document.querySelectorAll(".board li").forEach(li => {
    const text = li.querySelector("span")?.textContent || "";

    let priority = "low";
    if (li.classList.contains("priority-high")) priority = "high";
    else if (li.classList.contains("priority-medium")) priority = "medium";

    const column = li.parentElement.id.replace("-list", "");
    const category = li.dataset.category || "shopping";

    tasks.push({ text, status: column, priority, category });
  });

  // merge with other categories
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const otherTasks = allTasks.filter(t => t.category !== "shopping");

  localStorage.setItem("tasks", JSON.stringify([...otherTasks, ...tasks]));
}

// ---------------- INIT ----------------
loadTasks();

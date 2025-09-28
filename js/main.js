const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('todoList');
const progressList = document.getElementById("progressList");
const completedList = document.getElementById("completedList");
const themeToggle = document.getElementById("themeToggle");

// Load saved theme on startup
window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
});

// Load saved tasks when page loads and also auto focuses cursor to input field
window.onload = () => {
  loadTasks();
  taskInput.focus(); // 👈 focus the input when page is ready
};

// ---------------- UPDATE TASK STATUS IN STORAGE (same as category dashboards) ----------------
function updateTaskStatus(taskText, taskCategory, newStatus) {
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
  const taskIndex = allTasks.findIndex(t => 
    t.text === taskText && t.category === taskCategory
  );

  if (taskIndex !== -1) {
    allTasks[taskIndex].status = newStatus;
    localStorage.setItem("tasks", JSON.stringify(allTasks));
  }
}

// ---------------- REMOVE TASK FROM STORAGE ----------------
function removeTaskFromStorage(taskText, taskCategory) {
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const updatedTasks = allTasks.filter(t => 
    !(t.text === taskText && t.category === taskCategory)
  );
  localStorage.setItem("tasks", JSON.stringify(updatedTasks));
}

// ---------------- ADD TASK ----------------
function addTask(taskTextParam, status = "todo", priorityParam, categoryParam) {
  const taskText = taskTextParam || taskInput.value.trim();
  if (taskText === "") return;

  // Get priority either from passed param or dropdown input
  const priority = priorityParam || document.getElementById("priorityInput").value;

  const li = document.createElement("li");
  li.setAttribute("draggable", "true");
  li.classList.add("task-item");

  // apply priority class
  li.classList.add(`priority-${priority}`);

  // Inside addTask
  const category = categoryParam || document.getElementById("categoryInput")?.value || "work";
  li.dataset.category = category; //enables filtering by work,personal,shopping

  // span for text
  const span = document.createElement("span");
  span.textContent = taskText;

  // toggle completed on click
  span.addEventListener("click", () => {
    span.classList.toggle("completed");
    saveTasks();
    updateCounter();
  });

  // drag start
  li.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", null); // needed for Firefox
    li.classList.add("dragging");
  });

  // drag end - Updated to use direct localStorage update
  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    
    // Determine new status based on which column the task is in
    let newStatus = "todo";
    if (progressList.contains(li)) newStatus = "progress";
    else if (completedList.contains(li)) newStatus = "completed";
    
    // Update localStorage directly
    updateTaskStatus(span.textContent, category, newStatus);
    
    updateCounter();
  });

  // edit button
  const editBtn = document.createElement("button");
  editBtn.innerHTML = '<i class="fas fa-pen"></i>';
  editBtn.classList.add("edit-btn");
  editBtn.addEventListener("click", () => {
    const currentText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    
    li.replaceChild(input, span);
    editBtn.innerHTML = '<i class="fas fa-save"></i>';

    // when save is clicked
    const saveHandler = () => {
      const newText = input.value.trim() || currentText;
      span.textContent = newText;
      li.replaceChild(span, input);
      editBtn.innerHTML = '<i class="fas fa-pen"></i>';
      
      // Update task text in localStorage
      const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      const taskIndex = allTasks.findIndex(t => 
        t.text === currentText && t.category === category
      );
      if (taskIndex !== -1) {
        allTasks[taskIndex].text = newText;
        localStorage.setItem("tasks", JSON.stringify(allTasks));
      }
      
      editBtn.removeEventListener("click", saveHandler);
    };
    
    editBtn.addEventListener("click", saveHandler);
  });

  // delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.classList.add("delete-btn");
  
  deleteBtn.addEventListener("click", () => {
    const deletePopup = document.getElementById("deletePopup");
    const confirmBtn = document.getElementById("confirmDelete");
    const cancelBtn = document.getElementById("cancelDelete");

    deletePopup.style.display = "flex"; // show popup

    const handleConfirm = () => {
      // Remove from localStorage directly
      removeTaskFromStorage(span.textContent, category);
      li.remove();
      updateCounter();
      deletePopup.style.display = "none";

      // clean up event listeners
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
    };

    const handleCancel = () => {
      deletePopup.style.display = "none";
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
    };

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
  });

  // move dropdown
  const moveSelect = document.createElement("select");
  moveSelect.classList.add("move-select"); // Add the class for consistency
  ["todo", "progress", "completed"].forEach(col => {
    const option = document.createElement("option");
    option.value = col;
    option.textContent =
      col === "todo" ? "To Do" :
      col === "progress" ? "In Progress" : "Completed";
    if (col === status) option.selected = true;
    moveSelect.appendChild(option);
  });
  
  moveSelect.addEventListener("change", () => {
    moveTask(li, moveSelect.value);
    // Update localStorage directly
    updateTaskStatus(span.textContent, category, moveSelect.value);
    updateCounter();
  });

  // build li
  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  li.appendChild(moveSelect);

  // append to correct column
  moveTask(li, status);

  if (!taskTextParam) {
    taskInput.value = "";
    setTimeout(() => taskInput.focus(), 0);
  }

  // Always save tasks to localStorage
  saveTasks();
  updateCounter();
}

// ---------------- CELEBRATION ----------------
function celebrateCompletion() {
  // 🎉 Confetti
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.5 }
  });

  // 🔊 Sound
  const sound = document.getElementById("successSound");
  if (sound) {
    sound.currentTime = 0;
    sound.play()
      .then(() => console.log("🔊 sound played"))
      .catch(err => console.warn("⚠️ sound blocked:", err));
  }
}

// ---------------- MOVE TASK ----------------
function moveTask(taskEl, status) {
  if (status === "todo") taskList.appendChild(taskEl);
  if (status === "progress") progressList.appendChild(taskEl);
  if (status === "completed") {
    completedList.appendChild(taskEl);
    // Trigger celebration 🎉
    celebrateCompletion();
  }
  
  // Update the dropdown to match
  const select = taskEl.querySelector("select");
  if (select) select.value = status;
}

// ---------------- SAVE TASKS (rebuilt from DOM) ----------------
function saveTasks() {
  const tasks = [];

  document.querySelectorAll(".board li").forEach(li => {
    const text = li.querySelector("span")?.textContent || "";

    // Determine status by which column the task is in
    let status = "todo";
    if (li.parentElement && li.parentElement.id === "progressList") status = "progress";
    else if (li.parentElement && li.parentElement.id === "completedList") status = "completed";
    else if (li.parentElement && li.parentElement.id === "todoList") status = "todo";

    // extract priority from class
    let priority = "low";
    if (li.classList.contains("priority-high")) priority = "high";
    else if (li.classList.contains("priority-medium")) priority = "medium";

    // get category (default to "work" if missing)
    const category = li.dataset.category || "work";
    
    tasks.push({
      text,
      status,
      priority,
      category,
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateCounter();
}

// ---------------- LOAD TASKS ----------------
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
  // Clear existing tasks
  taskList.innerHTML = "";
  progressList.innerHTML = "";
  completedList.innerHTML = "";
  
  tasks.forEach(task => addTask(task.text, task.status, task.priority, task.category));
  updateCounter();
}

// ---------------- CLEAR ALL ----------------
const clearAllBtn = document.getElementById("clearAllBtn");
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    taskList.innerHTML = "";
    progressList.innerHTML = "";
    completedList.innerHTML = "";
    localStorage.removeItem("tasks");
    updateCounter();
  }
});

// ---------------- EVENT LISTENERS ----------------
addBtn.addEventListener("click", () => addTask());
taskInput.addEventListener("keypress", e => {
  if (e.key === "Enter") addTask();
});

// Toggle theme on button click
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    localStorage.setItem("theme", "light");
  }
});

// ---------- SEARCH (robust) ----------
(function () {
  const searchInput = document.getElementById("searchInput") 
                    || document.getElementById("taskSearch")
                    || null;

  if (!searchInput) {
    console.warn("Search input (#searchInput) not found — add <input id=\"searchInput\">");
    return;
  }

  function runFilter() {
    const q = searchInput.value.toLowerCase().trim();
    const nodes = document.querySelectorAll(".board li");

    nodes.forEach(li => {
      const text = (li.querySelector("span")?.textContent || "").toLowerCase();
      const category = (li.dataset.category || "").toLowerCase();
      const classes = Array.from(li.classList);
      const priority = (classes.find(c => c.startsWith("priority-")) || "").replace("priority-", "");

      const matches = q === "" || text.includes(q) || category.includes(q) || priority.includes(q);
      li.style.display = matches ? "" : "none";
    });
  }

  searchInput.addEventListener("input", runFilter);
  window.addEventListener("load", runFilter);
})();

//counter
function updateCounter() {
  const totalTasks = document.querySelectorAll(
    "#todoList li, #progressList li, #completedList li"
  ).length;

  const completedTasks = document.querySelectorAll("#completedList li").length;

  document.getElementById("taskCounter").textContent =
    `${completedTasks} of ${totalTasks} tasks completed`;
}

// enable drag & drop for all columns
document.addEventListener("dragstart", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  try { e.dataTransfer.setData("text/plain", "moving"); } catch (err) {}
  e.dataTransfer.effectAllowed = "move";
  li.classList.add("dragging");
});

document.addEventListener("dragend", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  li.classList.remove("dragging");
});

// clean column-based drop + highlight
const columns = document.querySelectorAll(".column");

columns.forEach(column => {
  const list = column.querySelector("ul");

  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("highlight");
  });

  column.addEventListener("dragenter", (e) => {
    e.preventDefault();
    column.classList.add("highlight");
  });

  column.addEventListener("dragleave", (e) => {
    const rect = column.getBoundingClientRect();
    const x = e.clientX, y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      column.classList.remove("highlight");
    }
  });

  //DROP HANDLER
  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("highlight");

    const dragging = document.querySelector(".dragging");
    if (!dragging) return;

    list.appendChild(dragging);

    // bounce
    dragging.classList.add("bounce");
    setTimeout(() => dragging.classList.remove("bounce"), 300);

    // Determine new status and update localStorage
    let newStatus = "todo";
    const taskText = dragging.querySelector("span").textContent;
    const taskCategory = dragging.dataset.category;
    
    if (column.classList.contains("todo")) newStatus = "todo";
    else if (column.classList.contains("in-progress")) newStatus = "progress";
    else if (column.classList.contains("completed")) {
      newStatus = "completed";
      celebrateCompletion(); // 🎉 sound + confetti
    }

    // Update dropdown to match
    const sel = dragging.querySelector("select");
    if (sel) sel.value = newStatus;

    // Update localStorage directly
    updateTaskStatus(taskText, taskCategory, newStatus);
    updateCounter();
  });
});

// Dashboard navigation dropdown (top-right)
const dashboardNav = document.getElementById("dashboardNav");
dashboardNav.addEventListener("change", () => {
  window.location.href = dashboardNav.value;
});

//"unlocks" audio after your first click anywhere.
document.addEventListener("click", () => {
  const sound = document.getElementById("successSound");
  if (sound) {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0;
    }).catch(() => {});
  }
}, { once: true });
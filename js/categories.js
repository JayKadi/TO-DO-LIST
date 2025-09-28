// ---------------- CONFIG ----------------
// Set this variable in each HTML file before loading this script:
// <script>const currentCategory = "work";</script>
// <script src="categories.js"></script>

// Or detect from URL/page title if you prefer
if (typeof currentCategory === 'undefined') {
  currentCategory = 
    window.location.pathname.includes('work') ? 'work' :
    window.location.pathname.includes('personal') ? 'personal' :
    window.location.pathname.includes('shopping') ? 'shopping' : 'work';
}

// ---------------- UPDATE TASK STATUS IN STORAGE (same as main dashboard) ----------------
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

// ---------------- LOAD TASKS ----------------
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  // Use same IDs as main dashboard
  document.getElementById("todoList").innerHTML = "";
  document.getElementById("progressList").innerHTML = "";
  document.getElementById("completedList").innerHTML = "";

  tasks
    .filter(t => t.category === currentCategory)
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

  // delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.classList.add("delete-btn");

  deleteBtn.addEventListener("click", () => {
    const deletePopup = document.getElementById("deletePopup");
    const confirmBtn = document.getElementById("confirmDelete");
    const cancelBtn = document.getElementById("cancelDelete");

    deletePopup.style.display = "flex";

    const handleConfirm = () => {
      // Remove from localStorage directly
      removeTaskFromStorage(span.textContent, task.category);
      li.remove();
      deletePopup.style.display = "none";
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

  li.appendChild(deleteBtn);

  // append to correct column - use same IDs as main dashboard  
  const listId = 
    task.status === "todo" ? "todoList" :
    task.status === "progress" ? "progressList" : "completedList";
  
  const list = document.getElementById(listId);

  if (list) {
    list.appendChild(li);
  }

  enableDragAndDrop(li);
}

// ---------------- DRAG & DROP ----------------
function enableDragAndDrop(li) {
  li.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", null); // needed for Firefox
    li.classList.add("dragging");
    console.log("➡️ drag started:", li.querySelector("span").textContent);
  });

  li.addEventListener("dragend", () => {
    li.classList.remove("dragging");
    console.log("⬅️ drag ended");

    // Determine status by parent element ID (same as main dashboard)
    let newStatus = "todo";
    const taskText = li.querySelector("span").textContent;
    const taskCategory = li.dataset.category;
    
    if (document.getElementById("progressList").contains(li)) newStatus = "progress";
    else if (document.getElementById("completedList").contains(li)) newStatus = "completed";
    
    console.log("📌 dropped in:", newStatus);

    // Update localStorage directly
    updateTaskStatus(taskText, taskCategory, newStatus);

    // 🎉 Trigger confetti if dropped in Completed
    if (newStatus === "completed") {
      console.log("🎉 celebrating completion");
      celebrateCompletion();
    }
  });
}

document.querySelectorAll(".column").forEach(column => {
  const ul = column.querySelector("ul");
  
  column.addEventListener("dragover", e => {
    e.preventDefault();
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("drag-over");
  });

  column.addEventListener("drop", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    if (dragging && ul) {
      ul.appendChild(dragging);
      column.classList.remove("drag-over");
    }
  });
});

// ---------------- SAVE TASKS (rebuilt from DOM - same as main dashboard) ----------------
function saveTasks() {
  const tasks = [];

  document.querySelectorAll(".board li").forEach(li => {
    const text = li.querySelector("span")?.textContent || "";

    // Determine status by which column the task is in (same logic as main)
    let status = "todo";
    if (li.parentElement && li.parentElement.id === "progressList") status = "progress";
    else if (li.parentElement && li.parentElement.id === "completedList") status = "completed";
    else if (li.parentElement && li.parentElement.id === "todoList") status = "todo";

    // extract priority from class
    let priority = "low";
    if (li.classList.contains("priority-high")) priority = "high";
    else if (li.classList.contains("priority-medium")) priority = "medium";

    // get category (default to currentCategory if missing)
    const category = li.dataset.category || currentCategory;
    
    tasks.push({
      text,
      status,
      priority,
      category,
    });
  });

  // Get all tasks and update only the current category
  const allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const otherCategoryTasks = allTasks.filter(t => t.category !== currentCategory);

  localStorage.setItem("tasks", JSON.stringify([...otherCategoryTasks, ...tasks]));
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

// enable drag & drop for all columns (same as main dashboard)
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

// clean column-based drop + highlight (same as main dashboard)
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

  //DROP HANDLER (same logic as main dashboard)
  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("highlight");

    const dragging = document.querySelector(".dragging");
    if (!dragging) return;

    list.appendChild(dragging);

    // bounce
    dragging.classList.add("bounce");
    setTimeout(() => dragging.classList.remove("bounce"), 300);

    // Determine new status and update localStorage (same as main dashboard)
    let newStatus = "todo";
    const taskText = dragging.querySelector("span").textContent;
    const taskCategory = dragging.dataset.category;
    
    if (column.classList.contains("todo")) newStatus = "todo";
    else if (column.classList.contains("in-progress")) newStatus = "progress";
    else if (column.classList.contains("completed")) {
      newStatus = "completed";
      celebrateCompletion(); // 🎉 sound + confetti
    }

    // Update localStorage directly
    updateTaskStatus(taskText, taskCategory, newStatus);
  });
});

// ---------------- INIT ----------------
loadTasks();
window.addEventListener('storage', () => {
  loadTasks(); // Reload tasks whenever localStorage changes
});

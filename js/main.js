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
      // Load saved tasks when page loads and also auto focuses curser to input field
  window.onload = () => {
  loadTasks();
  taskInput.focus(); // 👈 focus the input when page is ready
};

   
// ---------------- ADD TASK ----------------
function addTask(taskTextParam, status = "todo", priorityParam) {
  const taskText = taskTextParam || taskInput.value.trim();
  if (taskText === "") return;

  // Get priority either from passed param or dropdown input
  const priority = priorityParam || document.getElementById("priorityInput").value;

  const li = document.createElement("li");
  li.setAttribute("draggable", "true");
  li.classList.add("task-item"); // <-- add this

  // apply priority class
  li.classList.add(`priority-${priority}`);

// Inside addTask
const category = document.getElementById("categoryInput")?.value || "work";
li.dataset.category = category;//enables filtering by work,personal,shopping

  // span for text
  const span = document.createElement("span");
  span.textContent = taskText;

  // toggle completed on click
  span.addEventListener("click", () => {
    span.classList.toggle("completed");
    
    saveTasks();
    updateCounter();
  });
//makes the task draggable

// drag start
li.addEventListener("dragstart", e => {
  e.dataTransfer.setData("text/plain", null); // needed for Firefox
  li.classList.add("dragging");
});

// drag end
li.addEventListener("dragend", () => {
  li.classList.remove("dragging");
  saveTasks();
  updateCounter();
});

        // toggle completed when clicked
       span.addEventListener("click", () => {
  span.classList.toggle("completed");
  saveTasks();
  updateCounter();
});
         // edit button comes before delete 
   // edit button
  const editBtn = document.createElement("button");
  editBtn.innerHTML = '<i class="fas fa-pen"></i>';
  editBtn.classList.add("edit-btn");
  editBtn.addEventListener("click", () => {
    const currentText = span.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    // create input field
    
    li.replaceChild(input, span);
    editBtn.innerHTML = '<i class="fas fa-save"></i>';

    // replace span with input
    li.replaceChild(input, span);
    editBtn.textContent = "Save";

    // when save is clicked
    editBtn.addEventListener("click", () => {
      span.textContent = input.value.trim() || currentText;
      li.replaceChild(span, input);
      editBtn.textContent = "Edit";
      saveTasks();
    }, { once: true });
  });

        // delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.classList.add("delete-btn");
        //popup confirmation to delete a task
        deleteBtn.addEventListener("click", () => {
  const deletePopup = document.getElementById("deletePopup");
  const confirmBtn = document.getElementById("confirmDelete");
  const cancelBtn = document.getElementById("cancelDelete");

  deletePopup.style.display = "flex"; // show popup

  const handleConfirm = () => {
    li.remove();
    saveTasks();
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

//append everything in order

  // move dropdown
  const moveSelect = document.createElement("select");
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
    saveTasks();
    updateCounter();
  });
  //end of popup confirmation to delete a task
         // build li
  li.appendChild(span);
  li.appendChild(editBtn);//edit a button
  li.appendChild(deleteBtn);//delete a button
  li.appendChild(moveSelect);//move tasks



   // append to correct column
  moveTask(li, status);

    if (!taskTextParam) {
  taskInput.value = "";
  setTimeout(() => taskInput.focus(), 0);
}//moves cursor back to input fiels setting the timeout puts browser in delay browser handles button click and moves back to cursor
    
    // save after adding
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
  if (status === "todo") taskList.appendChild(taskEl); // ✅ use taskList (your todo list)
  if (status === "progress") progressList.appendChild(taskEl);
  if (status === "completed") {
    completedList.appendChild(taskEl);

    // Trigger celebration 🎉
    celebrateCompletion();
  }
}
       // ---------------- SAVE TASKS ----------------
function saveTasks() {
  const tasks = [];

  document.querySelectorAll(".board li").forEach(li => {
    const text = li.querySelector("span")?.textContent || "";

    // try to find a move-select, fallback to "todo"
    const sel = li.querySelector("select.move-select");
    const column = sel ? sel.value : "todo";

    // extract priority from class
    let priority = "low";
    if (li.classList.contains("priority-high")) priority = "high";
    else if (li.classList.contains("priority-medium")) priority = "medium";

    tasks.push({ text, status: column, priority });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateCounter();
}

 // Load tasks from localStorage
  
// ---------------- LOAD TASKS ----------------
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => addTask(task.text, task.status, task.priority));
  updateCounter();
}


 // ---------------- CLEAR ALL ----------------
const clearAllBtn = document.getElementById("clearAllBtn");
clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    todoList.innerHTML = "";
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
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; // switch to sun icon
    localStorage.setItem("theme", "dark");
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; // switch to moon icon
    localStorage.setItem("theme", "light");
  }
});
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
// drag start / end (delegated, works for dynamically added <li>)
document.addEventListener("dragstart", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  // required for Firefox
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
const columns = document.querySelectorAll(".column"); // selects the <div class="column ...">

columns.forEach(column => {
  const list = column.querySelector("ul"); // the actual <ul> where <li> live

  column.addEventListener("dragover", (e) => {
    e.preventDefault(); // allow drop
    column.classList.add("highlight");
  });

  column.addEventListener("dragenter", (e) => {
    e.preventDefault();
    column.classList.add("highlight");
  });

  column.addEventListener("dragleave", (e) => {
    // remove highlight when leaving the column area
    // this avoids flicker when moving between child elements
    const rect = column.getBoundingClientRect();
    const x = e.clientX, y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      column.classList.remove("highlight");
    }
  });

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("highlight");

    const dragging = document.querySelector(".dragging");
    if (!dragging) return;

    // append to this column's ul
    list.appendChild(dragging);

    // keep dropdown select in-sync (if your li contains <select>)
    const sel = dragging.querySelector("select");
    if (sel) {
      if (column.classList.contains("todo")) sel.value = "todo";
      else if (column.classList.contains("in-progress")) sel.value = "progress";
      else if (column.classList.contains("completed")) sel.value = "completed";
    }
     // 👇 Call moveTask so confetti + sound trigger when moved to completed
  if (column.classList.contains("todo")) moveTask(dragging, "todo");
  else if (column.classList.contains("in-progress")) moveTask(dragging, "progress");
  else if (column.classList.contains("completed")) moveTask(dragging, "completed");

    saveTasks();
    updateCounter();
  });
});
//makes top-right drop down switchable between dashboards
document.getElementById("categoryFilter").addEventListener("change", e => {
  const selected = e.target.value;
  document.querySelectorAll(".board li").forEach(li => {
    if (selected === "all" || li.dataset.category === selected) {
      li.style.display = "flex";
    } else {
      li.style.display = "none";
    }
  });
});
//Now for the filter dropdown at the top-right
const categoryFilter = document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", () => {
  const selectedCategory = categoryFilter.value;

  document.querySelectorAll(".task-item").forEach(task => {
    if (selectedCategory === "all" || task.dataset.category === selectedCategory) {
      task.style.display = "flex"; // show
    } else {
      task.style.display = "none"; // hide
    }
  });
});
//unlocks” audio after your first click anywhere.
document.addEventListener("click", () => {
  const sound = document.getElementById("successSound");
  if (sound) {
    sound.play().then(() => {
      sound.pause();
      sound.currentTime = 0; // reset
    }).catch(() => {});
  }
}, { once: true });


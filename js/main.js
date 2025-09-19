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
function addTask(taskTextParam, status = "todo") {
  const taskText = taskTextParam || taskInput.value.trim();
  if (taskText === "") return;
        const li = document.createElement("li");

li.setAttribute("draggable", "true");//makes the task draggable

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


        // span for text
        const span = document.createElement("span");
        span.textContent = taskText;

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
        deleteBtn.addEventListener("click", () => {
          li.remove();
        saveTasks();
        updateCounter();//updates task count when you delete a task
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
}//moves cursor back to input fiels setting the timeout puts browser in delay browser handles button click and moves back to cursor
    
    // save after adding
    saveTasks();
     updateCounter();
  }

      // ---------------- MOVE TASK ----------------
function moveTask(taskEl, status) {
  if (status === "todo") taskList.appendChild(taskEl); // ✅ use taskList (your todo list)
  if (status === "progress") progressList.appendChild(taskEl);
  if (status === "completed") completedList.appendChild(taskEl);
}
       // ---------------- SAVE TASKS ----------------
function saveTasks() {
  const tasks = [];

  document.querySelectorAll(".board li").forEach(li => {
    const text = li.querySelector("span").textContent;
    const column = li.querySelector("select").value;
    tasks.push({ text, status: column });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}
 // Load tasks from localStorage
  
// ---------------- LOAD TASKS ----------------
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(task => addTask(task.text, task.status));
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
[todoList, progressList, completedList].forEach(column => {
  // allow dropping
  column.addEventListener("dragover", e => {
    e.preventDefault();
    column.classList.add("highlight"); // add highlight effect
  });

  // remove highlight when leaving column
  column.addEventListener("dragleave", () => {
    column.classList.remove("highlight");
  });

  // handle drop
  column.addEventListener("drop", e => {
    e.preventDefault();
    column.classList.remove("highlight"); // remove highlight after drop

    const dragging = document.querySelector(".dragging");
    if (!dragging) return;

    // append into the new column
    column.appendChild(dragging);

    // update dropdown value to match new column
    const select = dragging.querySelector("select");
    if (column.id === "todoList") select.value = "todo";
    if (column.id === "progressList") select.value = "progress";
    if (column.id === "completedList") select.value = "completed";

    saveTasks();
    updateCounter();
  });
});

// add dragging class only during drag
document.addEventListener("dragstart", e => {
  if (e.target.tagName === "LI") {
    e.target.classList.add("dragging");
  }
});

document.addEventListener("dragend", e => {
  if (e.target.tagName === "LI") {
    e.target.classList.remove("dragging");
  }
});

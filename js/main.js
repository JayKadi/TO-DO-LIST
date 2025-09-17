const addBtn = document.getElementById('addBtn');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

      // Load saved tasks when page loads and also auto focuses curser to input field
  window.onload = () => {
  loadTasks();
  taskInput.focus(); // 👈 focus the input when page is ready
};
   function addTask(taskTextParam) {
  const taskText = taskTextParam || taskInput.value.trim();
  if (taskText === "") return;

        const li = document.createElement("li");

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
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("edit-btn");
  editBtn.addEventListener("click", () => {
    const currentText = span.textContent;

    // create input field
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;

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
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => {
          li.remove();
        saveTasks();
        updateCounter();//updates task count when you delete a task
        });
//append everything in order
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

    if (!taskTextParam) {
  taskInput.value = "";
  setTimeout(() => taskInput.focus(), 0);
}//moves cursor back to input fiels setting the timeout puts browser in delay browser handles button click and moves back to cursor
    
    // save after adding
    saveTasks();
  }
      // add task when button clicked
      addBtn.addEventListener("click", addTask);

      // add task when Enter key pressed
      taskInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          addTask();
          updateCounter();//updates task count when you add a task
        }
      });
      
       // Save tasks to localStorage
  function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li span').forEach(span => {
      tasks.push({
        text: span.textContent,
        completed: span.classList.contains("completed")
      });
      updateCounter();
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
 // Load tasks from localStorage
  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(task => {
      addTask(task.text);
      // mark completed if it was saved as done
      if (task.completed) {
        taskList.lastChild.querySelector("span").classList.add("completed");
      }
    });
     updateCounter();//updates task count after loading from locl storage
  }
  const clearAllBtn = document.getElementById('clearAllBtn');

clearAllBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    taskList.innerHTML = ""; // clears the UI
    localStorage.removeItem("tasks"); // clears localStorage
     updateCounter();
  }
});
function updateCounter() {
  const total = document.querySelectorAll('#taskList li').length;
  const completed = document.querySelectorAll('#taskList li span.completed').length;
  const counter = document.getElementById('taskCounter');

  if (total === 0) {
    counter.textContent = "No tasks 🎉";
  } else {
    counter.textContent = `${completed} of ${total} tasks completed`;
  }
}



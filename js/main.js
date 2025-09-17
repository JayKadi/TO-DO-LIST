const addBtn = document.getElementById('addBtn');
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

      // Load saved tasks when page loads
  window.onload = loadTasks;

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
        });

        // delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => {
          li.remove();
        saveTasks();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

       // clear input if coming from form
    if (taskInput.value.trim() !== "") {
      taskInput.value = "";
    }
    
    // save after adding
    saveTasks();
  }
      // add task when button clicked
      addBtn.addEventListener("click", addTask);

      // add task when Enter key pressed
      taskInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          addTask();
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
  }
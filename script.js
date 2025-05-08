function addTodo() {
    const input = document.getElementById("taskInput");
    var task = input.value;
    console.log("Input element:", task)
    if (task.trim() !== "") {
        const ul = document.getElementById("taskList");
        const li = document.createElement("li");
        li.textContent = task;
        ul.appendChild(li);
        input.value = ""; 
    } else {
        alert("Task cannot be empty!");
    }
}

addEventListener("click", function(event) {
    if (event.target.tagName === "LI") {
        event.target.remove();
    }
})

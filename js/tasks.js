async function renderTasks({ tasksFp, parentElement }) {
    let tasks = await loadJSONFile({ filename: tasksFp });

    for (let task in tasks) {
        let taskNode = document.createElement("li");
        let subtasksNode = document.createElement("ul");
        subtasksNode.className = "subtasks";

        taskNode.innerText = task;
        renderSubTasks({ subtasks: tasks[task], parentTasksList: subtasksNode })
        
        taskNode.appendChild(subtasksNode);
        parentElement.appendChild(taskNode);
    }
}

function loadJSONFile({ filename }) {
    let result = fetch(filename)
        .then(response => response.json());

    return result;
}


function renderSubTasks({ subtasks, parentTasksList }) {
    for (let [subTaskText, isDone] of Object.entries(subtasks)) {
        let subTaskNode = createSubTask({ text: subTaskText, isDone: isDone })
        parentTasksList.appendChild(subTaskNode);
    }

}

function createSubTask({ text, isDone }) {
    let subtaskNode = document.createElement("li");
    
    let subtaskInput = document.createElement("input");
    subtaskInput.value = text;
    subtaskInput.className = "subtaskField";
    subtaskNode.appendChild(subtaskInput);

    let subtaskCheckbox = document.createElement("input");
    subtaskCheckbox.type = "checkbox";
    subtaskCheckbox.checked = isDone;
    subtaskNode.appendChild(subtaskCheckbox);

    subtaskNode.draggable = true;
    return subtaskNode;
}


let tasksListElement = document.getElementById('tasks');
renderTasks({ tasksFp: "tasks.json", parentElement: tasksListElement });

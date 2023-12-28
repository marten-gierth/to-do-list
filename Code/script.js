let tasks = [];

// Funktionen für die Bearbeitung des Titels
function handleTitleEdit(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Verhindert den Zeilenumbruch durch die Eingabetaste
    document.getElementById('pageTitle').blur(); // Beendet die Bearbeitung des Titels
    changeTitle(); // Aktualisiert den Titel
  }
}

function changeTitle() {
  const newTitle = document.getElementById('pageTitle').innerText.trim();
  if (newTitle !== '') {
    document.getElementById('pageTitle').innerText = newTitle;
    document.title = newTitle + " - To-Do-Liste"; // Ändert auch den Titel des Browserfensters
  }
}

function displayTasks() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';

  tasks.forEach((task, index) => {
    const listItem = document.createElement('li');
    const deleteButton = document.createElement('button');
    const checkbox = document.createElement('input');
    const taskDescription = document.createElement('span');

    deleteButton.innerText = '🗑️';
    deleteButton.classList.add('deleteTaskButton');
    deleteButton.onclick = function() {
      deleteTask(index);
      displayTasks(); // Aktualisiert die Aufgabenliste nach dem Löschen
    };
    deleteButton.style.display = 'none';

    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.onchange = function() {
      toggleTask(this);
    };

    taskDescription.textContent = task.taskText;
    taskDescription.classList.add('taskDescription');
    taskDescription.addEventListener('click', (event) => {
      taskDescription.contentEditable = 'true'; // Startet die Bearbeitung des Textes
      taskDescription.focus(); // Setzt den Fokus auf das bearbeitbare Element
    });
    taskDescription.addEventListener('keypress', (event) => {
      handleTaskEdit(event, listItem, task, index);
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(taskDescription);
    listItem.appendChild(deleteButton);
    taskList.appendChild(listItem);
  });
}



function addTask() {
  const taskInput = document.getElementById('taskInput');
  const newTask = taskInput.value.trim();

  if (newTask !== '') {
    tasks.push({ taskText: newTask, completed: false });
    taskInput.value = '';
    displayTasks();
    resetPencilButton(); // Hier wird der Stift-Button zurück in seinen Standardzustand versetzt
  }
}

function toggleTask(checkbox) {
  const taskText = checkbox.nextSibling.textContent.trim();
  const task = tasks.find(task => task.taskText === taskText);

  if (task) {
    task.completed = checkbox.checked;
  }
}

// Funktion für Erfolgsmeldungen
function showSuccessMessage(message) {
  // Hier können Sie die Erfolgsmeldung anpassen oder darstellen, wie gewünscht
  alert(`Erfolgreich: ${message}`);
}

// Funktionen zum Herunterladen und Hochladen der Aufgabenliste
function downloadTasks() {
  let taskListContent = document.getElementById('pageTitle').innerText + '\n\n';
  taskListContent += tasks.map(task => `${task.completed ? '✔' : '❌'} ${task.taskText}`).join('\n');

  // Ersetzen von grafischen Icons durch Unicode-Zeichen
  taskListContent = taskListContent.replace(/✔/g, '\u2714').replace(/❌/g, '\u2716');

  const blob = new Blob([taskListContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todolist.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Erfolgsmeldung für den Download
  showSuccessMessage('Die Aufgabenliste wurde erfolgreich heruntergeladen.');
}

function uploadTasks(input) {
  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const content = event.target.result;
    const lines = content.split('\n');

    tasks = [];

    if (lines.length > 0) {
      const trimmedLine = lines[0].trim();
      // Immer den Inhalt der ersten Zeile als Titel setzen
      document.getElementById('pageTitle').innerText = trimmedLine;
    } else {
      // Falls die Datei leer ist, den Titel zurücksetzen
      document.getElementById('pageTitle').innerText = 'Meine To-Do-Liste';
    }

    for (let i = 1; i < lines.length; i++) {
      const trimmedLine = lines[i].trim();
      if (trimmedLine !== '') {
        let completed = false;
        let taskText = trimmedLine.trim();

        // Überprüfen, ob die Zeile mit dem Häkchen oder dem Kreuz beginnt
        if (taskText.startsWith('✔') || taskText.startsWith('\u2714')) {
          completed = true;
          taskText = taskText.slice(1).trim(); // Entfernt das Häkchen bzw. Kreuz aus dem Text
        } else if (taskText.startsWith('✖') || taskText.startsWith('\u2716')) {
          // Falls es sich um ein Kreuz handelt, als nicht abgeschlossen markieren
          completed = false;
          taskText = taskText.slice(1).trim(); // Entfernt das Kreuz aus dem Text
        }

        tasks.push({
          completed: completed,
          taskText: taskText
        });
      }
    }

    displayTasks();
    // Erfolgsmeldung für den Upload
    showSuccessMessage('Die Aufgabenliste wurde erfolgreich hochgeladen.');
  };

  // Überprüfen, ob eine Datei ausgewählt wurde
  if (file) {
    reader.readAsText(file);
  }

  // Überwachen der Änderungen im Datei-Upload-Feld
  input.value = ''; // Zurücksetzen des Wertes, um erneutes Hochladen derselben Datei zu ermöglichen
}


// Fügt einen Eventlistener für die Eingabetaste (Enter) hinzu
document.getElementById('taskInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    addTask();
  }
});

const styleToggle = document.getElementById('styleToggle');
let darkModeEnabled = false;

styleToggle.addEventListener('click', () => {
  if (darkModeEnabled) {
    swapStyleSheet('light.css');
    styleToggle.classList.remove('dark-mode');
  } else {
    swapStyleSheet('dark.css');
    styleToggle.classList.add('dark-mode');
  }
  
  darkModeEnabled = !darkModeEnabled;
});


function swapStyleSheet(sheet) {
  const pageStyle = document.getElementById('pageStyle');
  pageStyle.setAttribute('href', sheet);
}


let isPencilButtonClicked = false;

function toggleBackgroundColor() {
  const pencilButton = document.getElementById('pencilButton');
  const deleteButtons = document.querySelectorAll('.deleteTaskButton');

  if (!isPencilButtonClicked) {
    pencilButton.style.backgroundColor = 'rgb(222, 222, 222)';
    deleteButtons.forEach(button => {
      button.style.display = 'inline-block'; // Anzeigen der Mülleimer-Buttons
    });
  } else {
    pencilButton.style.backgroundColor = 'white';
    deleteButtons.forEach(button => {
      button.style.display = 'none'; // Ausblenden der Mülleimer-Buttons
    });
  }

  isPencilButtonClicked = !isPencilButtonClicked;
}


function resetPencilButton() {
  const pencilButton = document.getElementById('pencilButton');
  const deleteButtons = document.querySelectorAll('.deleteTaskButton');

  pencilButton.style.backgroundColor = 'white'; // Stift-Button zurücksetzen

  deleteButtons.forEach(button => {
    button.style.display = 'none'; // Mülleimer-Buttons ausblenden
  });

  isPencilButtonClicked = false; // Zurücksetzen des Zustands des Stift-Buttons
}


function deleteTask(index) {
  tasks.splice(index, 1); // Entfernt die Aufgabe aus dem Array anhand des Index
}


function handleTaskEdit(event, listItem, task, index) {
  const taskDescription = listItem.querySelector('.taskDescription');

  if (event.key === 'Enter') {
    event.preventDefault(); // Verhindert den Zeilenumbruch durch die Eingabetaste
    taskDescription.contentEditable = 'false'; // Beendet die Bearbeitung des Textes
    task.taskText = taskDescription.textContent.trim(); // Aktualisiert den Text der Aufgabe
  }
}

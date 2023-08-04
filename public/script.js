// public/script.js
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const noteTitle = document.getElementById("note-title");
const noteText = document.getElementById("note-text");
const saveButton = document.getElementById("save-button");
const saveIcon = document.getElementById("save-icon");
const writeIcon = document.getElementById("write-icon");

// Function to fetch existing notes from the server
async function fetchNotes() {
  const response = await fetch("/api/notes");
  const notes = await response.json();

  notesList.innerHTML = "";

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.innerText = note.title;
    li.dataset.noteId = note.id;
    li.innerHTML += '<i class="fas fa-trash delete-icon"></i>';
    notesList.appendChild(li);
  });
}

// Function to handle the form submission and show/hide Save icon
async function saveNote() {
  const title = noteTitle.value.trim();
  const text = noteText.value.trim();

  if (!title || !text) {
    alert("Title and text are required fields.");
    return;
  }

  const response = await fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, text }),
  });

  if (response.ok) {
    noteTitle.value = "";
    noteText.value = "";
    fetchNotes();
    showSaveIcon(false);
  } else {
    alert("Failed to save note.");
  }
}

// Function to show or hide the Save icon
function showSaveIcon(show) {
  saveIcon.style.display = show ? "inline" : "none";
}

// Function to handle the delete action for a note
async function deleteNote(noteId) {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    fetchNotes();
    noteTitle.value = "";
    noteText.value = "";
    showSaveIcon(false);
  } else {
    alert("Failed to delete note.");
  }
}

// Function to show the details of a selected note
async function showNoteDetails(noteId) {
  const response = await fetch(`/api/notes/${noteId}`);
  const note = await response.json();

  noteTitle.value = note.title;
  noteText.value = note.text;
}

// Event listener for the Save button
saveButton.addEventListener("click", saveNote);

// Event listener for the form submission
noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveNote();
});

// Event listener for the Write icon
writeIcon.addEventListener("click", () => {
  noteTitle.value = "";
  noteText.value = "";
  showSaveIcon(false);
});

// Event listener for the Delete icon and showing note details
notesList.addEventListener("click", async (e) => {
  if (e.target.tagName === "LI") {
    const noteId = e.target.dataset.noteId;
    showNoteDetails(noteId); // Show details when clicking on a note
  } else if (e.target.classList.contains("delete-icon")) {
    const noteId = e.target.parentElement.dataset.noteId;
    deleteNote(noteId);
  }
});

// Function to add the selected class to the clicked note
notesList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const notes = document.querySelectorAll("#notes-list li");
    notes.forEach((note) => {
      note.classList.remove("selected");
    });
    e.target.classList.add("selected");
  }
});

// Function to check if the form has input and show/hide the Save icon accordingly
function checkFormInput() {
  const title = noteTitle.value.trim();
  const text = noteText.value.trim();
  showSaveIcon(title !== "" && text !== "");
}

// Event listener for the note title and text inputs
noteTitle.addEventListener("input", checkFormInput);
noteText.addEventListener("input", checkFormInput);

// Initial fetch on page load
fetchNotes();

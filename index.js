// app.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const notesFilePath = path.join(__dirname, "db.json");

// Route to serve the index.html page as the landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to serve the notes.html page
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

// Route to get all notes
app.get("/api/notes", (req, res) => {
  fs.readFile(notesFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read notes data." });
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

// Route to get a specific note by ID
app.get("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  fs.readFile(notesFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read notes data." });
    }
    const notes = JSON.parse(data);
    const note = notes.find((note) => note.id === noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }
    res.json(note);
  });
});

// Route to save a new note
app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) {
    return res
      .status(400)
      .json({ error: "Title and text are required fields." });
  }

  fs.readFile(notesFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read notes data." });
    }
    const notes = JSON.parse(data);
    const newNote = { id: uuidv4(), title, text };
    notes.push(newNote);
    fs.writeFile(notesFilePath, JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save note." });
      }
      res.json(newNote);
    });
  });
});

// Route to delete a note by ID
app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  fs.readFile(notesFilePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to read notes data." });
    }
    let notes = JSON.parse(data);
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: "Note not found." });
    }
    notes.splice(noteIndex, 1);
    fs.writeFile(notesFilePath, JSON.stringify(notes), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete note." });
      }
      res.json({ message: "Note deleted successfully." });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

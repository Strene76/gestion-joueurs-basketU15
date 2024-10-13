const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// Création des tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    passengerCount INTEGER NOT NULL,
    tripType TEXT NOT NULL,
    date TEXT NOT NULL
  )`);
});

// Routes pour les joueurs
app.post('/api/players', (req, res) => {
  const { name, date } = req.body;
  db.run(`INSERT INTO players (name, date) VALUES (?, ?)`, [name, date], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // Renvoyer les données complètes du joueur créé
    db.get(`SELECT * FROM players WHERE id = ?`, [this.lastID], (err, row) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

app.get('/api/players', (req, res) => {
  db.all(`SELECT * FROM players`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.delete('/api/players/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM players WHERE id = ?`, id, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "Joueur supprimé avec succès" });
  });
});

// Routes pour les conducteurs
app.post('/api/drivers', (req, res) => {
  const { name, passengerCount, tripType, date } = req.body;
  db.run(`INSERT INTO drivers (name, passengerCount, tripType, date) VALUES (?, ?, ?, ?)`, 
    [name, passengerCount, tripType, date], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // Renvoyer les données complètes du conducteur créé
    db.get(`SELECT * FROM drivers WHERE id = ?`, [this.lastID], (err, row) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

app.get('/api/drivers', (req, res) => {
  db.all(`SELECT * FROM drivers`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.delete('/api/drivers/:id', (req, res) => {
  const id = req.params.id;
  db.run(`DELETE FROM drivers WHERE id = ?`, id, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "Conducteur supprimé avec succès" });
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

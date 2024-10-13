const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Utilisation d'une base de données en mémoire pour Render
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// Création de la table si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  car_type TEXT NOT NULL,
  trip_type TEXT NOT NULL
)`);

// Route pour ajouter un joueur
app.post('/api/players', (req, res) => {
  const { name, carType, tripType } = req.body;
  db.run(`INSERT INTO players (name, car_type, trip_type) VALUES (?, ?, ?)`, 
    [name, carType, tripType], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Route pour récupérer tous les joueurs
app.get('/api/players', (req, res) => {
  db.all(`SELECT * FROM players`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Servir l'application frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

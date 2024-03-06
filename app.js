const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const config = require('./config');
const ejs = require('ejs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Подключение к MySQL
const db = mysql.createConnection(config.database);

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Создание таблицы, если она не существует
db.query(
  'CREATE TABLE IF NOT EXISTS picture (id INT AUTO_INCREMENT PRIMARY KEY, author VARCHAR(255), name VARCHAR(255), imageLink VARCHAR(255), tags VARCHAR(255))',
  (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created or already exists');
    }
  }
);

// Handle form submissions
app.post('/process', (req, res) => {
  const { name, imageLink, author, tags } = req.body;
  const sql = 'INSERT INTO picture (name, imageLink, author, tags) VALUES (?, ?, ?, ?)';
  const values = [name, imageLink, author, tags];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting into database: ' + err.stack);
      res.send('Error inserting into database');
    } else {
      res.redirect('/admin');
    }
  });
});

// Display records
app.get('/admin', (req, res) => {
  const sql = 'SELECT * FROM picture';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching from database: ' + err.stack);
      res.send('Error fetching from database');
    } else {
      res.render('adminpage', { posts: rows });
    }
  });
});

// CRUD операции

// Создание (Create)
app.post('/pictures', (req, res) => {
  const { name, author, imageLink } = req.body;
  db.query('INSERT INTO picture (name, author, imageLink) VALUES (?, ?, ?)', [name, author, imageLink], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: result.insertId, name, author, imageLink });
    }
  });
});

// Чтение (Read)
app.get('/pictures', (req, res) => {
  db.query('SELECT * FROM picture', (err, data) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.render('index', { data });
    }
  });
});

// Обновление (Update)
app.post('/admin/update/:id', (req, res) => {
  const itemId = req.params.id;
  const { newAuthor, newTags } = req.body;

  const sql = 'UPDATE picture SET author = ?, tags = ? WHERE id = ?';
  const values = [newAuthor, newTags, itemId];

  db.query(sql, values, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.redirect('/admin');
    }
  });
});

// Удаление (Delete)
app.post('/admin/delete/:id', (req, res) => {
  const itemId = req.params.id;

  db.query('DELETE FROM picture WHERE id = ?', [itemId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.redirect('/admin');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

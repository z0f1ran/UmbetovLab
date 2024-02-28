const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const config = require('./config');
const ejs = require('ejs')

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.json());

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
  'CREATE TABLE IF NOT EXISTS picture (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), description TEXT, imageLink VARCHAR(255))',
  (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Table created or already exists');
    }
  }
);

// CRUD операции

// Создание (Create)
app.post('/pictures', (req, res) => {
  const { name, description, imageLink } = req.body;
  db.query('INSERT INTO picture (name, description, imageLink) VALUES (?, ?, ?)', [name, description, imageLink], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: result.insertId, name, description, imageLink });
    }
  });
});

// Чтение (Read)
app.get('/pictures', (req, res) => {
  db.query('SELECT * FROM picture', (err, data) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.render('test_template', {data})
    }
  });
});

// Обновление (Update)
app.put('/pictures/:id', (req, res) => {
  const { name, description, imageLink } = req.body;
  const itemId = req.params.id;
  db.query(
    'UPDATE picture SET name = ?, description = ?,  imageLink = ? WHERE id = ?',
    [name, description, imageLink, itemId],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: itemId, name, description, imageLink });
      }
    }
  );
});

// Удаление (Delete)
app.delete('/pictures/:id', (req, res) => {
  const itemId = req.params.id;
  db.query('DELETE FROM picture WHERE id = ?', [itemId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Picture deleted successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

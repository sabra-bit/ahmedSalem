const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Configure Multer for file uploads
const upload = multer({ limits: { fileSize: 1000000 }  });

// Connect to SQLite database
const db = new sqlite3.Database('./images.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create table if it doesn't exist (replace with your desired schema)
const createTableQuery = `
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  data BLOB NOT NULL
);
`;

db.run(createTableQuery, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Table created (if it did not exist).');
  }
});

// Parse incoming form data (for potential additional form fields)
app.use(bodyParser.urlencoded({ extended: false }));

// Route for uploading an image
app.post('/upload', upload.single('image'), (req, res) => {
  
    if (req.file) {
    const imageName = req.file.originalname;
    const imageData = req.file.buffer;; // Read image data

    const insertQuery = `INSERT INTO images (name, data) VALUES (?, ?)`;

    db.run(insertQuery, [imageName, imageData], (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).send('Error uploading image.');
      } else {
        res.send('Image uploaded successfully!');
      }
    });
  } else {
    res.status(400).send('No image uploaded.');
  }
});

// Route for downloading an image by ID
app.get('/download/:id', (req, res) => {
  const imageId = req.params.id;

  const selectQuery = `SELECT * FROM images WHERE id = ?`;

  db.get(selectQuery, [imageId], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Error downloading image.');
    } else if (!row) {
      res.status(404).send('Image not found.');
    } else {
      res.setHeader('Content-Type', 'image/jpeg'); // Adjust for image type based on data
      res.send(row.data);
    }
  });
});
app.get('/',  (req, res) => {
    // Set flash message (assuming successful login)
    
    
    // Render homepage with message (if present)
    // res.sendFile(__dirname+'/views/login.ejs', { flashMessage: req.flash('success') });
    res.render("view.ejs")
  });
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

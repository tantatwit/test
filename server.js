const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const db = new sqlite3.Database('recipes.db');

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set up the 'views' directory for storing templates
app.set('views', __dirname);

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipeName TEXT,
    ingredients TEXT,
    instructions TEXT,
    picture BLOB
)`);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.static('index.html'));
app.use(express.static('about.html'));

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Serve the recipe submission page
app.get('/submission', (req, res) => {
    res.sendFile(__dirname + '/submission.html');
});

// Serve the recipes page
app.get('/recipes', (req, res) => {
    // Retrieve recipes from the database
    db.all('SELECT * FROM recipes', [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('recipes', { recipes: rows });
    });
});

// Handling form submission
app.post('/addRecipe', upload.single('picture'), (req, res) => {
    const { recipeName, ingredients, instructions } = req.body;
    const picture = req.file.buffer;

    // Insert data into database
    db.run(`INSERT INTO recipes (recipeName, ingredients, instructions, picture) VALUES (?, ?, ?, ?)`,
        [recipeName, ingredients, instructions, picture], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });

    // Redirect back to the recipe submission page to clear form fields
    res.redirect('/submission');
});

// Redirect from root URL to the recipes page
app.get('/', (req, res) => {
    res.redirect('/recipes');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

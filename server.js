const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Store projects in memory (temporary)
let projects = [];

// Set up file storage
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Serve static files
app.use(express.static(__dirname));

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    const project = {
        title: req.body.title,
        description: req.body.description,
        file: `/uploads/${req.file.filename}`
    };
    projects.push(project); // Add to array
    console.log('New project added:', project);
    res.send('Project uploaded! Check the uploads folder.');
});

// Serve projects list
app.get('/projects', (req, res) => {
    res.json(projects); // Send projects as JSON
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
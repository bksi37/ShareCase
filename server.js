const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Store projects in memory
let projects = [];

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.use(express.static(__dirname));

app.post('/upload', upload.single('file'), (req, res) => {
    const project = {
        title: req.body.title,
        description: req.body.description,
        file: `/uploads/${req.file.filename}`,
        views: 0,
        likes: 0,
        comments: 0
    };
    projects.push(project);
    console.log('New project:', project);
    res.send('Project uploaded! Check the uploads folder.');
});

app.get('/projects', (req, res) => {
    res.json(projects);
});

// Serve specific pages
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));
app.get('/project', (req, res) => res.sendFile(path.join(__dirname, 'project.html')));
app.get('/browse', (req, res) => res.sendFile(path.join(__dirname, 'browse.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, 'settings.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.use((req, res) => res.sendFile(path.join(__dirname, '404.html')));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

// Persistent storage for projects and users
const projectsFile = path.join(__dirname, 'projects.json');
const usersFile = path.join(__dirname, 'users.json');
let projects = [];
let users = [];
if (fs.existsSync(projectsFile)) {
    projects = JSON.parse(fs.readFileSync(projectsFile));
}
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
}

// Session middleware
app.use(session({
    secret: 'sharecase-secret',
    resave: false,
    saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage }).fields([
    { name: 'image', maxCount: 1 },
    { name: 'objFile', maxCount: 1 }
]);

app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Sign-up endpoint
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    if (users.find(user => user.email === email)) {
        return res.status(400).send('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { email, password: hashedPassword };
    users.push(user);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    req.session.user = user;
    res.redirect('/dashboard');
});

// Sign-in endpoint
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Logout endpoint
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index.html');
});

app.post('/upload', isAuthenticated, upload, (req, res) => {
    const project = {
        title: req.body.title,
        description: req.body.description,
        problemStatement: req.body.problemStatement,
        collaborators: req.body.collaborators ? req.body.collaborators.split(',').map(email => email.trim()) : [],
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        image: req.files.image ? `/uploads/${req.files.image[0].filename}` : null,
        objFile: req.files.objFile ? `/uploads/${req.files.objFile[0].filename}` : null,
        author: req.session.user.email,
        views: 0,
        likes: 0,
        comments: 0
    };
    projects.push(project);
    fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
    console.log('New project:', project);
    res.send('Project uploaded! Check the uploads folder.');
});

app.get('/projects', (req, res) => {
    res.json(projects);
});

app.get('/search', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.tags.some(tag => tag.toLowerCase().includes(query)) ||
        project.collaborators.some(collab => collab.toLowerCase().includes(query))
    );
    res.json(filteredProjects);
});

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/dashboard', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/profile', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));
app.get('/project', (req, res) => res.sendFile(path.join(__dirname, 'project.html')));
app.get('/browse', (req, res) => res.sendFile(path.join(__dirname, 'browse.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/settings', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'settings.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));
app.use((req, res) => res.sendFile(path.join(__dirname, '404.html')));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
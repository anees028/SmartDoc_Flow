// server/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken'); // <--- NEW IMPORT

const app = express();
const PORT = 3000;
const JWT_SECRET = 'my_key'; // <--- NEW: In real apps, put this in .env file

app.use(cors());
app.use(express.json());

// ... (Keep your storage/multer config exactly the same) ...
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

let documents = [];

// ... (Keep your simulateAIProcessing function exactly the same) ...
const runAIAgent = (docId) => {
    // ... same code as before ...
    setTimeout(() => {
        const docIndex = documents.findIndex(d => d.id === docId);
        if (docIndex !== -1) {
            documents[docIndex].status = 'COMPLETED';
            documents[docIndex].data = {
                summary: "Invoice for Server Maintenance",
                amount: Math.floor(Math.random() * 1000) + 100,
                confidence: "98%"
            };
        }
    }, 5000);
};

// --- NEW: AUTH MIDDLEWARE ---
// This acts as a "Bouncer". It checks if the request has a valid token.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

    if (!token) return res.sendStatus(401); // Unauthorized (No token)

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden (Invalid token)
        req.user = user; // Attach user info to request
        next(); // Allow them to pass
    });
};

// --- ROUTES ---

// 1. NEW: Login Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Hardcoded user for practice (In real app, check DB)
    if (username === 'admin' && password === 'admin') {
        // Create the token
        const user = { name: username };
        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' }); 
        
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// 2. PROTECTED: Upload Route (Added authenticateToken)
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    const newDoc = {
        id: Date.now().toString(),
        originalName: req.file.originalname,
        fileName: req.file.filename,
        status: 'PROCESSING',
        uploadTime: new Date(),
        data: {}
    };

    documents.push(newDoc);
    runAIAgent(newDoc.id);

    res.status(201).json(newDoc);
});

// 3. PROTECTED: Get Documents (Added authenticateToken)
app.get('/api/documents', authenticateToken, (req, res) => {
    const sortedDocs = documents.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    res.json(sortedDocs);
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
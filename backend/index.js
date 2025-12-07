// server/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Enable CORS so Vue (port 5173) can access Node (port 3000)
app.use(cors());
app.use(express.json());

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Configure Storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- MOCK DATABASE ---
let documents = [];

// --- SIMULATED AI AGENT ---
const runAIAgent = (docId) => {
    console.log(`🤖 AI Agent: Analyzing document ${docId}...`);
    
    // Simulate 5 seconds of "Thinking"
    setTimeout(() => {
        const docIndex = documents.findIndex(d => d.id === docId);
        if (docIndex !== -1) {
            documents[docIndex].status = 'COMPLETED';
            // Mock extracted data
            documents[docIndex].data = {
                summary: "Invoice for Server Maintenance",
                amount: Math.floor(Math.random() * 1000) + 100, // Random amount
                confidence: "98%"
            };
            console.log(`✅ AI Agent: Finished document ${docId}`);
        }
    }, 5000);
};

// --- ROUTES ---

// 1. Upload Route
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const newDoc = {
        id: Date.now().toString(),
        originalName: req.file.originalname,
        fileName: req.file.filename,
        status: 'PROCESSING', // Initial status
        uploadTime: new Date(),
        data: {} // Empty until AI finishes
    };

    documents.push(newDoc);
    
    // Trigger the "AI"
    runAIAgent(newDoc.id);

    res.status(201).json(newDoc);
});

// 2. Get All Documents Route
app.get('/api/documents', (req, res) => {
    // Sort by newest first
    const sortedDocs = documents.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    res.json(sortedDocs);
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
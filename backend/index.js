// server/index.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { PORT, UPLOAD_DIR } = require('./src/config/appConfig');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Use Routes
app.use('/api', apiRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server MVC started on http://localhost:${PORT}`);
});
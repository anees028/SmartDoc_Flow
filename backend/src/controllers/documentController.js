const DocumentModel = require('../models/DocumentModel');
const BotService = require('../services/BotService');
const path = require('path');

exports.uploadDocument = (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded.');

    // 1. Create Record
    const newDoc = DocumentModel.create({
        id: Date.now().toString(),
        originalName: req.file.originalname,
        fileName: req.file.filename,
        status: 'PROCESSING',
        uploadTime: new Date(),
        data: {}
    });

    // 2. Trigger Async Service (Fire & Forget)
    const fullPath = path.resolve(req.file.path);
    BotService.analyzeDocument(newDoc.id, fullPath);

    // 3. Return Response immediately
    res.status(201).json(newDoc);
};

exports.getDocuments = (req, res) => {
    const docs = DocumentModel.findAll();
    res.json(docs);
};
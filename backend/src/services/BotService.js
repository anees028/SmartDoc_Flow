// src/services/BotService.js
const fs = require('fs');
const DocumentModel = require('../models/DocumentModel');

const analyzeDocument = (docId, filePath) => {
    console.log(`🤖 Service: analyzing doc ${docId}...`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return console.error("Read Error:", err);

        const content = data.toLowerCase();
        let result = { summary: "Unknown Document", amount: 0, confidence: "0%" };
        let newStatus = 'REVIEW_NEEDED';

        // 1. LOGIC ENGINE
        if (content.includes('invoice') || content.includes('bill')) {
            result.summary = "Invoice Detected";
            result.confidence = "95%";
            
            // Extract Amount Regex
            const amountMatch = data.match(/\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            if (amountMatch) {
                const amount = parseFloat(amountMatch[1].replace(',', ''));
                result.amount = amount;
                
                // Business Rule: Auto-Approve small amounts
                newStatus = amount < 500 ? 'AUTO_APPROVED' : 'REQUIRES_APPROVAL';
            }
        } 
        else if (content.includes('contract') || content.includes('agreement')) {
            result.summary = "Legal Agreement";
            result.confidence = "88%";
            newStatus = 'PENDING_LEGAL';
        }

        // 2. DELAY SIMULATION & DB UPDATE
        setTimeout(() => {
            DocumentModel.update(docId, {
                status: newStatus,
                data: result
            });
            console.log(`✅ Service: Doc ${docId} updated to ${newStatus}`);
        }, 3000);
    });
};

module.exports = { analyzeDocument };
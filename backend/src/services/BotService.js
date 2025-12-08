// server/src/services/BotService.js
const fs = require('fs');
const pdf = require('pdf-parse');
const natural = require('natural');
const DocumentModel = require('../models/DocumentModel');

// --- 1. THE AGENT'S BRAIN (NLP Classifier) ---
// We create a Bayesian Classifier. It learns by associating words with categories.
const classifier = new natural.BayesClassifier();

// We "Teach" the agent some basic concepts on startup
const trainAgent = () => {
    console.log("🧠 Agent: Loading knowledge base...");
    
    // Teach it what an Invoice looks like
    classifier.addDocument('invoice bill total amount due payment tax vat', 'INVOICE');
    classifier.addDocument('payment received purchase order cost fee', 'INVOICE');
    
    // Teach it what a Receipt (like REWE/Supermarket) looks like
    classifier.addDocument('market store receipt cash change card total rewe aldi lidl', 'RECEIPT');
    classifier.addDocument('thank you for shopping visit again', 'RECEIPT');

    // Teach it what a Resume/CV looks like
    classifier.addDocument('resume cv experience education skills references profile worked', 'RESUME');
    classifier.addDocument('university bachelor master graduated email phone', 'RESUME');

    classifier.train();
    console.log("🧠 Agent: Training complete.");
};

// Train immediately when this file is loaded
trainAgent();

// --- 2. THE AGENT'S EYES (Text Extractor) ---
const extractText = async (filePath) => {
    const buffer = fs.readFileSync(filePath);

    // If it is a PDF, use the PDF Parser
    if (filePath.toLowerCase().endsWith('.pdf')) {
        try {
            const data = await pdf(buffer);
            return data.text; // Return the extracted text
        } catch (err) {
            console.error("PDF Parse Error:", err);
            return "";
        }
    } 
    // If it is a Text file, read as string
    else {
        return buffer.toString('utf8');
    }
};

// --- 3. THE ANALYSIS PROCESS ---
const analyzeDocument = async (docId, filePath) => {
    console.log(`🤖 Agent: Reading document ${docId}...`);

    try {
        // Step A: Extract Text (See)
        const rawText = await extractText(filePath);
        const cleanText = rawText.toLowerCase(); // Normalization
        
        // Step B: Classify (Think)
        // The classifier looks at the text and guesses the category
        const category = classifier.classify(cleanText); 
        
        console.log(`🧠 Agent: I think this is a ${category}`);

        // Step C: Extract Data (Act)
        let extractedAmount = 0;
        let finalStatus = 'REVIEW_NEEDED';

        // Attempt to find money (Regex for $ or €)
        // Matches: $500, 500.00, 500,00 EUR
        const amountMatch = rawText.match(/[\€\$]?\s?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/);
        
        if (amountMatch) {
            // Cleanup price string (replace ',' with '.' for JS math)
            let priceString = amountMatch[1].replace(',', '.');
            extractedAmount = parseFloat(priceString);
        }

        // Logic based on AI Category
        if (category === 'INVOICE') {
            finalStatus = extractedAmount < 20 ? 'AUTO_APPROVED' : 'REQUIRES_APPROVAL';
        } 
        else if (category === 'RECEIPT') {
            finalStatus = 'AUTO_APPROVED'; // Receipts are usually small expenses
        }
        else if (category === 'RESUME') {
            finalStatus = 'ARCHIVED_HR'; // Send to HR
            extractedAmount = 0; // Resumes don't have monetary value
        }

        // Step D: Update Database
        setTimeout(() => {
            DocumentModel.update(docId, {
                status: finalStatus,
                data: {
                    summary: `${category} Detected`, // e.g., "RECEIPT Detected"
                    amount: extractedAmount,
                    confidence: "High (AI)"
                }
            });
            console.log(`✅ Agent: Finished doc ${docId}`);
        }, 2000);

    } catch (err) {
        console.error("Analysis Failed:", err);
    }
};

module.exports = { analyzeDocument };
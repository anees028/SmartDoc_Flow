// src/models/DocumentModel.js
class DocumentModel {
    constructor() {
        this.db = []; // Acts as our database table
    }

    create(doc) {
        this.db.push(doc);
        return doc;
    }

    findAll() {
        // Sort by newest first
        return this.db.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    }

    findById(id) {
        return this.db.find(d => d.id === id);
    }

    update(id, updates) {
        const docIndex = this.db.findIndex(d => d.id === id);
        if (docIndex !== -1) {
            this.db[docIndex] = { ...this.db[docIndex], ...updates };
            return this.db[docIndex];
        }
        return null;
    }
}

module.exports = new DocumentModel(); // Export as Singleton
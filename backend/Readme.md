# 🤖 SmartDoc Flow - Backend API

A robust Node.js backend designed for **Business Process Automation**. This system handles document ingestion, implements secure authentication (JWT), and features an intelligent **AI Agent** that asynchronously classifies and extracts data from uploaded files (PDFs/Text) using Natural Language Processing (NLP).

## 🚀 Key Features

* **MVC Architecture:** Clean separation of concerns (Controllers, Services, Models).
* **Asynchronous Processing:** Non-blocking architecture where file uploads trigger background "AI Agents" without delaying the API response.
* **Intelligent Analysis:**
    * **Perception:** Uses `pdf-parse` to extract raw text from binary PDF files.
    * **Cognition:** Uses `natural` (Bayesian Classifier) to categorize documents (e.g., *Invoice* vs. *Resume*).
    * **Extraction:** Regex-based pattern matching to detect monetary values.
* **Automated Decisioning:** Implements business logic to "Auto-Approve" low-value receipts or flag high-value invoices for review.
* **Security:** JWT (JSON Web Token) authentication middleware protects sensitive routes.

## 📂 Project Structure (MVC)

### The project follows a modular Model-View-Controller pattern to ensure scalability and testability.

```text
server/
│
├── src/
│   ├── config/             # Configuration (Env variables, Secrets)
│   ├── controllers/        # Request Handlers (Traffic Cops)
│   │   ├── authController.js      # Handles Login & Token Generation
│   │   └── documentController.js  # Handles Uploads & Data Retrieval
│   │   
│   ├── models/             # Data Layer
│   │   └── DocumentModel.js       # In-Memory Database (Singleton)
│   │   
│   ├── services/           # Business Logic & AI (The "Brain")
│   │   └── BotService.js          # Handles NLP Classification & Parsing
│   │   
│   ├── middleware/         # Interceptors
│   │   └── authMiddleware.js      # Verifies JWT Bearer Tokens
│   │   
│   └── routes/             # API Endpoint Definitions
│       └── apiRoutes.js           # Maps URLs to Controllers
│
├── uploads/                # Local storage for uploaded files
├── index.js                # Application Entry Point
└── package.json            # Dependencies

🛠️ Technology Stack
Runtime: Node.js

Framework: Express.js

AI/ML:

natural: Tokenization and Bayesian Classification.

pdf-parse: Text extraction from PDF binaries.

Security: jsonwebtoken (JWT).

File Handling: multer.

⚙️ Installation & Setup
Clone & Install

Bash
cd server
npm install
Start the Server

Bash
npm run dev
# OR
node index.js
The server runs on http://localhost:3000

Default Credentials (for Testing)

Username: admin

Password: password

🧠 The AI Workflow
This system mimics a real-world "Agentic" workflow:

Ingestion: User uploads a file (PDF/TXT) via POST /api/upload.

Immediate Response: The server saves the file, creates a record with status PROCESSING, and immediately returns 201 Created to the client. The user does not wait for the AI.

Background Analysis (The Service Layer):

Step 1 (See): BotService reads the file stream. If it's a PDF, it parses binary data into text.

Step 2 (Think): The BayesClassifier (trained on startup) analyzes the vocabulary to determine if the doc is an Invoice, Receipt, or Resume.

Step 3 (Extract): Regex patterns look for currency symbols and amounts (e.g., $500.00).

Step 4 (Decide):

If Invoice < $500: Status -> AUTO_APPROVED

If Invoice > $500: Status -> REQUIRES_APPROVAL

If Resume: Status -> ARCHIVED_HR

Completion: The Service updates the Model. The Frontend polls GET /api/documents to reflect the new status.

🔌 API Endpoints
1. Authentication
POST /api/login

Body: { "username": "admin", "password": "password" }

Response: { "token": "eyJh..." }

2. Documents (Protected)
All following routes require Header: Authorization: Bearer <token>

POST /api/upload

Body: multipart/form-data (Key: file)

Response: JSON object of the new document (Status: PROCESSING).

GET /api/documents

Response: Array of all documents with current analysis status.

📝 Developer Notes
Why In-Memory DB? For the purpose of this technical assessment, DocumentModel.js uses an in-memory array. In a production environment, this would be swapped for a MongoDB Model without changing any Controller logic.

Why Async? Processing PDFs and running NLP tasks is CPU intensive. By decoupling the analysis from the HTTP response, we ensure the API remains high-performance and responsive under load.
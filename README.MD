# AI Knowledge Box

AI Knowledge Box is a small web application that allows users to save notes or website links and ask questions based on the saved content.  
The application uses a simple Retrieval-Augmented Generation (RAG) approach to find relevant information and generate answers.

This project was built to understand how frontend, backend, databases, and basic AI concepts work together in a real application.

---

## Features

- Add short text notes
- Add website URLs (content is fetched on the backend)
- Store content in a local database
- Ask questions based on saved content
- Retrieve relevant information using semantic similarity
- Generate answers with source references
- Works completely on local system

---

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express
- SQLite database

### AI / Logic
- Local embedding generation (TF-IDF based)
- Cosine similarity for semantic search
- Optional OpenAI integration for better answers

---

## Project Structure

ai-knowledge-box/
│
├── backend/
│ ├── src/
│ │ ├── server.js
│ │ ├── rag.js
│ │ ├── db.js
│ │ ├── embedding.js
│ │ ├── chunking.js
│ │ └── logger.js
│ └── knowledge.db
│
├── frontend/
│ ├── src/
│ └── vite.config.js
│
└── README.md


---

## How the App Works

1. User adds a note or a URL from the frontend
2. Backend stores the content in the database
3. Content is split into smaller chunks
4. Embeddings are generated for each chunk
5. When a question is asked:
   - The question is embedded
   - Similar chunks are retrieved
   - An answer is generated using the relevant content
6. The answer and source snippets are shown to the user

---

## Setup Instructions (Run Locally)

### Prerequisites
- Node.js installed (v18 or above)
- npm installed

---

### Backend Setup

```bash
cd backend
npm install
npm run start
Backend will run on:

http://localhost:3001
Optional .env file:

PORT=3001
OPENAI_API_KEY=your_api_key_here
NODE_ENV=development
Frontend Setup
Open a new terminal:

cd frontend
npm install
npm run dev
Frontend will run on:

http://localhost:5173
API Endpoints
Add Content
POST /api/ingest
{
  "type": "note",
  "content": "React is a JavaScript library"
}
Ask Question
POST /api/query
{
  "question": "What is React?"
}
Get All Saved Items
GET /api/items
Design Decisions
SQLite was used because it is lightweight and easy to manage

Local embeddings were used to avoid API dependency

Simple chunking strategy was chosen to keep logic understandable

Single-user system was implemented to reduce complexity

Limitations
No user authentication

Local embeddings give basic results

UI is simple and focused on functionality

Not optimized for large datasets

Future Improvements
Add user login

Use OpenAI or other LLMs for better answers

Improve UI design

Add pagination and search filters

Deploy the app online

Learning Outcome
Through this project, I learned:

How frontend and backend communicate

How to design REST APIs

How RAG pipelines work

How to use SQLite in Node.js

How to structure a full-stack project

Author
Built by Uday Kiran Kalli.
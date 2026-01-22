# AI Knowledge Box

A simple RAG (Retrieval-Augmented Generation) application that allows users to save notes and URLs, then ask questions based on the saved content.

Built to demonstrate understanding of full-stack development, database integration, and basic AI concepts.

---

## Features

- Add and store text notes or website URLs
- Query saved content using natural language questions
- Retrieve relevant information using semantic similarity
- Generate answers with source references
- Fully local setup (no external dependencies required)

---

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS  
**Backend:** Node.js, Express, SQLite  
**AI/Search:** TF-IDF embeddings, Cosine similarity, Optional OpenAI integration

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/ai-knowledge-box.git
cd ai-knowledge-box
```

**2. Setup Backend**
```bash
cd backend
npm install
npm run start
```
Backend runs at `http://localhost:3001`

**3. Setup Frontend** *(new terminal)*
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

**4. Optional: Add OpenAI API Key**

Create `backend/.env`:
```env
OPENAI_API_KEY=your_api_key_here
```

---

## Project Structure
```
ai-knowledge-box/
├── backend/
│   ├── src/
│   │   ├── server.js       # Express server
│   │   ├── rag.js          # RAG logic
│   │   ├── db.js           # SQLite operations
│   │   ├── embedding.js    # TF-IDF embeddings
│   │   ├── chunking.js     # Text chunking
│   │   └── logger.js       # Logging
│   └── knowledge.db        # SQLite database
│
└── frontend/
    └── src/                # React components
```

---

## How It Works

1. **Ingestion:** User adds content (note/URL) → Backend fetches and stores in SQLite
2. **Processing:** Content is chunked and converted to TF-IDF embeddings
3. **Query:** User asks a question → Question is embedded
4. **Retrieval:** System finds top-k similar chunks using cosine similarity
5. **Generation:** Answer is generated from relevant chunks (local or OpenAI)
6. **Response:** User receives answer with source snippets

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Add note or URL |
| POST | `/api/query` | Ask a question |
| GET | `/api/items` | Get all saved items |

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is React?"}'
```

---

## Design Decisions & Tradeoffs

### 1. **SQLite vs PostgreSQL**
**Choice:** SQLite  
**Why:** Simpler setup for local development, no external database server required  
**Tradeoff:** Not suitable for production with multiple concurrent users

### 2. **Local TF-IDF Embeddings vs External APIs**
**Choice:** TF-IDF with optional OpenAI  
**Why:** Works offline, no API costs for basic functionality  
**Tradeoff:** Less accurate than modern embedding models (e.g., OpenAI, Cohere)

### 3. **Simple Chunking Strategy**
**Choice:** Fixed-size chunks with overlap  
**Why:** Easy to implement and understand  
**Tradeoff:** Doesn't preserve semantic boundaries (better: sentence-based chunking)

### 4. **No User Authentication**
**Choice:** Single-user system  
**Why:** Reduces complexity, focuses on core RAG functionality  
**Tradeoff:** Cannot be used in multi-user environments

### 5. **REST API vs GraphQL**
**Choice:** REST  
**Why:** Simpler for this use case, fewer dependencies  
**Tradeoff:** Less flexible for complex queries

### 6. **In-Memory vs Persistent Vector Store**
**Choice:** Embeddings generated on-the-fly  
**Why:** Avoids additional dependencies (Pinecone, ChromaDB)  
**Tradeoff:** Slower query times as dataset grows

---

## Known Limitations

- No pagination for large datasets (>1000 items)
- Basic error handling (needs improvement for production)
- UI is functional but minimal
- Embedding quality limited by TF-IDF approach
- No caching mechanism for repeated queries

---

## Future Improvements

- [ ] Implement proper vector database (ChromaDB, Pinecone)
- [ ] Add user authentication with JWT
- [ ] Use better embeddings (sentence-transformers, OpenAI)
- [ ] Implement semantic chunking
- [ ] Add conversation history/memory
- [ ] Deploy to cloud platform

---

## What I Learned

- Designing and implementing a RAG pipeline from scratch
- Frontend-backend integration with REST APIs
- Working with SQLite in Node.js
- Text processing: chunking and embedding generation
- Semantic search using cosine similarity
- Managing project structure for full-stack applications

---

## Testing the Application

1. Start both servers (backend and frontend)
2. Add a note: `"React is a JavaScript library for building UIs"`
3. Ask a question: `"What is React?"`
4. Verify you receive an answer with source reference

---

## Author

**Uday Kiran Kalli**

---

## License

MIT License - feel free to use this project for learning purposes.
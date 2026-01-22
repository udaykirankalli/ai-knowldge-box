AI Knowledge Box
A lightweight web application that lets you save notes and website links, then ask questions about your saved content using AI-powered search.
I built this to learn how different parts of a web app work together - from the database to the frontend to basic AI concepts.

What it does

Save text notes
Save website URLs (content gets fetched automatically)
Ask questions about anything you've saved
Get answers with references to where the info came from
Everything runs on your computer, no cloud required


Built with
Frontend

React
Vite
JavaScript
CSS

Backend

Node.js
Express
SQLite

AI stuff

TF-IDF based embeddings (runs locally)
Cosine similarity for finding relevant content
Optional OpenAI integration if you want better answers


How it works

You add a note or URL through the web interface
Backend saves it to the database
Content gets split into smaller chunks
Each chunk gets converted into an embedding (basically a numerical representation)
When you ask a question:

Your question gets embedded too
System finds the most similar chunks
Generates an answer using those relevant pieces


You get the answer plus snippets showing where it came from


Project structure
ai-knowledge-box/
│
├── backend/
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── rag.js              # RAG logic
│   │   ├── db.js               # Database operations
│   │   ├── embedding.js        # Embedding generation
│   │   ├── chunking.js         # Text chunking
│   │   └── logger.js           # Logging utility
│   └── knowledge.db            # SQLite database
│
├── frontend/
│   ├── src/
│   └── vite.config.js
│
└── README.md

Running it locally
What you need:

Node.js (version 18 or newer)
npm

Setting up the backend:
bashcd backend
npm install
npm run start
```

Backend runs at `http://localhost:3001`

**Optional - create a `.env` file in the backend folder:**
```
PORT=3001
OPENAI_API_KEY=your_api_key_here
NODE_ENV=development
Setting up the frontend:
Open a new terminal window:
bashcd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## API endpoints

**Add content**
```
POST /api/ingest

{
  "type": "note",
  "content": "React is a JavaScript library"
}
```

**Ask a question**
```
POST /api/query

{
  "question": "What is React?"
}
```

**Get all saved items**
```
GET /api/items

Why I made certain choices

SQLite - Easy to set up, no separate database server needed
Local embeddings - Works without internet or API keys
Simple chunking - Keeps the logic easy to understand
Single user - Simplified the whole system


Current limitations

No user accounts or authentication
Local embeddings aren't as good as commercial alternatives
UI is pretty basic (focused on learning, not design)
Not built for handling massive amounts of data


What I might add later

User login system
Better AI responses using OpenAI or similar
Nicer looking interface
Pagination and filtering for saved items
Deploy it so others can use it online


What I learned
This project taught me:

How frontend and backend talk to each other
Designing REST APIs from scratch
How RAG (Retrieval-Augmented Generation) actually works
Working with SQLite in Node.js
Organizing a full-stack project properly


Author
Built by Uday Kiran Kalli
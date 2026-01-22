import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from './db.js';
import RAGService from './rag.js';
import ContentFetcher from './fetcher.js';
import Logger from './logger.js';

dotenv.config();

const logger = new Logger('Server');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

const db = new Database();
const rag = new RAGService(db, process.env.OPENAI_API_KEY);
const fetcher = new ContentFetcher();

await db.initialize();

app.post('/api/ingest', async (req, res) => {
  try {
    const { type, content } = req.body;

    if (!type || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both type and content are required'
      });
    }

    if (!['note', 'url'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid type',
        details: 'Type must be either "note" or "url"'
      });
    }

    if (typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid content',
        details: 'Content must be a non-empty string'
      });
    }

    let textContent = content;
    let sourceUrl = null;

    if (type === 'url') {
      try {
        textContent = await fetcher.fetchUrl(content);
        sourceUrl = content;
      } catch (err) {
        return res.status(400).json({
          error: 'URL fetch failed',
          details: err.message
        });
      }
    }

    const result = await rag.ingestContent(textContent, type, sourceUrl);

    res.status(201).json({
      success: true,
      itemId: result.itemId,
      chunksCreated: result.chunksCreated
    });

  } catch (err) {
    logger.error('Ingestion endpoint error', { error: err.message });
    res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await db.getAllItems();
    
    res.json({
      success: true,
      items: items.map(item => ({
        id: item.id,
        type: item.source_type,
        url: item.source_url,
        preview: item.preview,
        createdAt: item.created_at
      })),
      total: items.length
    });

  } catch (err) {
    logger.error('Items endpoint error', { error: err.message });
    res.status(500).json({
      error: 'Failed to retrieve items',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.post('/api/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid question',
        details: 'Question must be a non-empty string'
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        error: 'Question too long',
        details: 'Question must be under 500 characters'
      });
    }

    const result = await rag.query(question);

    res.json({
      success: true,
      answer: result.answer,
      sources: result.sources
    });

  } catch (err) {
    logger.error('Query endpoint error', { error: err.message });
    res.status(500).json({
      error: 'Query processing failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});


app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
    status: "OK"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, env: process.env.NODE_ENV });
});

process.on('SIGINT', () => {
  logger.info('Shutting down gracefully');
  db.close();
  process.exit(0);
});
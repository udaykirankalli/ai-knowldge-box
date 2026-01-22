import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import Logger from './logger.js';

const logger = new Logger('Database');

class Database {
  constructor(dbPath = './knowledge.db') {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Failed to connect to database', { error: err.message });
        throw err;
      }
      logger.info('Connected to SQLite database');
    });

    this.run = promisify(this.db.run.bind(this.db));
    this.get = promisify(this.db.get.bind(this.db));
    this.all = promisify(this.db.all.bind(this.db));
  }

  async initialize() {
  const schema = `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_url TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chunks_item_id ON chunks(item_id);
  `;

  try {
    await new Promise((resolve, reject) => {
      this.db.exec(schema, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    logger.info('Database schema initialized');
  } catch (err) {
    logger.error('Failed to initialize schema', { error: err.message });
    throw err;
  }
}


  async insertItem(id, content, sourceType, sourceUrl = null) {
    const query = `
      INSERT INTO items (id, content, source_type, source_url, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.run(query, [id, content, sourceType, sourceUrl, Date.now()]);
    logger.debug('Item inserted', { id, sourceType });
  }

  async insertChunk(id, itemId, content, embedding, chunkIndex) {
    const query = `
      INSERT INTO chunks (id, item_id, content, embedding, chunk_index)
      VALUES (?, ?, ?, ?, ?)
    `;
    await this.run(query, [id, itemId, content, JSON.stringify(embedding), chunkIndex]);
  }

  async getAllItems() {
    const query = `
      SELECT id, source_type, source_url, created_at,
             substr(content, 1, 200) as preview
      FROM items
      ORDER BY created_at DESC
    `;
    return await this.all(query);
  }

  async getAllChunks() {
    const query = `SELECT id, content, embedding FROM chunks`;
    const rows = await this.all(query);
    return rows.map(row => ({
      id: row.id,
      content: row.content,
      embedding: JSON.parse(row.embedding)
    }));
  }

  async getItemById(itemId) {
    return await this.get(`SELECT * FROM items WHERE id = ?`, [itemId]);
  }

  async getChunksByItemId(itemId) {
    return await this.all(`SELECT * FROM chunks WHERE item_id = ?`, [itemId]);
  }

  close() {
    this.db.close();
  }
}

export default Database;
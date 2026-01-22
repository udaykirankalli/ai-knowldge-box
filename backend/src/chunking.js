import Logger from './logger.js';

const logger = new Logger('Chunking');

/**
 * Chunking Strategy:
 * - Fixed-size chunks with overlap to preserve context
 * - 500 chars per chunk, 100 char overlap
 * - Simple but effective for most text
 * 
 * Production considerations:
 * - For code: use AST-based chunking
 * - For docs: paragraph-aware splitting
 * - For long docs: hierarchical chunking
 */
class ChunkingService {
  constructor(chunkSize = 500, overlap = 100) {
    this.chunkSize = chunkSize;
    this.overlap = overlap;
    
    if (overlap >= chunkSize) {
      throw new Error('Overlap must be smaller than chunk size');
    }
  }

  chunkText(text) {
    if (!text || text.trim().length === 0) {
      logger.warn('Empty text provided for chunking');
      return [];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + this.chunkSize, text.length);
      const chunk = text.slice(start, end).trim();
      
      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      start += this.chunkSize - this.overlap;
    }

    logger.debug('Text chunked', {
      originalLength: text.length,
      numChunks: chunks.length,
      avgChunkSize: chunks.reduce((sum, c) => sum + c.length, 0) / chunks.length
    });

    return chunks;
  }
}

export default ChunkingService;
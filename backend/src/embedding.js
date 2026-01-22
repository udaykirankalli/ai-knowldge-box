import Logger from './logger.js';

const logger = new Logger('Embeddings');

class EmbeddingService {
  constructor() {
    this.dimensions = 384;
    logger.info('Using local TF-IDF embedding service (no API key needed)');
  }

  async generateEmbedding(text) {
    try {
      const normalized = text.toLowerCase().trim();
      const words = normalized.split(/\s+/).filter(w => w.length > 2);
      
      const embedding = new Array(this.dimensions).fill(0);
      
      words.forEach((word, wordIdx) => {
        const wordHash = this._hashString(word);
        
        for (let i = 0; i < 3; i++) {
          const idx = (wordHash + i * 127) % this.dimensions;
          embedding[idx] += 1.0 / Math.sqrt(wordIdx + 1);
        }
        
        if (wordIdx > 0) {
          const bigramHash = this._hashString(words[wordIdx - 1] + word);
          const bigramIdx = bigramHash % this.dimensions;
          embedding[bigramIdx] += 0.5;
        }
      });
      
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      const normalized_embedding = embedding.map(val => val / (magnitude || 1));
      
      logger.debug('Generated embedding', { 
        textLength: text.length,
        uniqueWords: new Set(words).size,
        dimensions: this.dimensions
      });

      return normalized_embedding;
    } catch (err) {
      logger.error('Embedding generation failed', { error: err.message });
      throw new Error(`Embedding failed: ${err.message}`);
    }
  }

  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
  }
}

export default EmbeddingService;
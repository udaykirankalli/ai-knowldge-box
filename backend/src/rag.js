import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import Logger from './logger.js';
import EmbeddingService from './embedding.js';
import ChunkingService from './chunking.js';

const logger = new Logger('RAG');

class RAGService {
  constructor(db, openaiApiKey) {
    this.db = db;
    this.embeddings = new EmbeddingService();
    this.chunking = new ChunkingService(500, 100);

    this.openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
    this.useOpenAI = !!openaiApiKey;

    logger.info(
      this.useOpenAI
        ? 'OpenAI enabled for answer generation'
        : 'Running in local-only RAG mode'
    );
  }

  async ingestContent(content, sourceType, sourceUrl = null) {
    const itemId = uuidv4();

    try {
      await this.db.insertItem(itemId, content, sourceType, sourceUrl);

      const chunks = this.chunking.chunkText(content);
      if (chunks.length === 0) {
        throw new Error('No chunks generated from content');
      }

      logger.info('Generating embeddings', {
        itemId,
        chunks: chunks.length
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunkId = uuidv4();
        const embedding = await this.embeddings.generateEmbedding(chunks[i]);
        await this.db.insertChunk(chunkId, itemId, chunks[i], embedding, i);
      }

      return {
        itemId,
        chunksCreated: chunks.length
      };
    } catch (err) {
      logger.error('Ingestion failed', { error: err.message });
      throw err;
    }
  }

  async query(question, topK = 5) {
    try {
      logger.info('Processing query', { question });

      const questionEmbedding =
        await this.embeddings.generateEmbedding(question);

      const allChunks = await this.db.getAllChunks();
      if (allChunks.length === 0) {
        return {
          answer:
            "I don't have any content yet. Please add some notes or URLs first.",
          sources: []
        };
      }

      const rankedChunks = allChunks
        .map(chunk => ({
          ...chunk,
          similarity: this.embeddings.cosineSimilarity(
            questionEmbedding,
            chunk.embedding
          )
        }))
        .filter(chunk => chunk.similarity > 0.03)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      if (rankedChunks.length === 0) {
        return {
          answer:
            "I couldn't find relevant information in your notes. Try rephrasing the question or adding more content.",
          sources: []
        };
      }

      const context = rankedChunks
        .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
        .join('\n\n');

      let answer;
      if (this.useOpenAI) {
        try {
          answer = await this._generateAnswerWithOpenAI(question, context);
        } catch (err) {
          logger.warn('OpenAI failed, using local answer', {
            error: err.message
          });
          answer = this._generateLocalAnswer(rankedChunks);
        }
      } else {
        answer = this._generateLocalAnswer(rankedChunks);
      }

      const sources = rankedChunks.map(chunk => ({
        preview: chunk.content.slice(0, 150) + '...',
        similarity: Number(chunk.similarity.toFixed(3))
      }));

      return { answer, sources };
    } catch (err) {
      logger.error('Query failed', { error: err.message });
      throw err;
    }
  }
  async _generateAnswerWithOpenAI(question, context) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Answer only using the provided context. Be concise and factual.'
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion:\n${question}`
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    return response.choices[0].message.content.trim();
  }

  _generateLocalAnswer(rankedChunks) {
    const topChunk = rankedChunks[0];

    if (!topChunk || topChunk.similarity < 0.05) {
      return "I couldn't find relevant information in your notes. Try adding more content.";
    }

    let answer = 'Based on your saved content:\n\n';

    rankedChunks.slice(0, 3).forEach(chunk => {
      if (chunk.similarity > 0.05) {
        const sentences = chunk.content
          .split(/[.!?]+/)
          .map(s => s.trim())
          .filter(s => s.length > 15);

        if (sentences.length > 0) {
          answer += `• ${sentences[0]}.\n`;
        } else {
          answer += `• ${chunk.content.slice(0, 120)}...\n`;
        }
      }
    });

    answer += '\n(Note: Using local answer generation.)';
    return answer.trim();
  }
}

export default RAGService;

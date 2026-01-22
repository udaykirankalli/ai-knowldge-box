import axios from 'axios';
import * as cheerio from 'cheerio';
import Logger from './logger.js';

const logger = new Logger('Fetcher');

/**
 * URL content fetcher with basic extraction
 * Production improvements:
 * - Add user-agent rotation
 * - Handle JavaScript-rendered pages (Puppeteer)
 * - Respect robots.txt
 * - Add caching layer
 */
class ContentFetcher {
  async fetchUrl(url) {
    try {
      logger.info('Fetching URL', { url });

      const response = await axios.get(url, {
        timeout: 10000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; KnowledgeInbox/1.0)'
        }
      });

      const contentType = response.headers['content-type'];
      
      if (!contentType || !contentType.includes('text/html')) {
        throw new Error(`Unsupported content type: ${contentType}`);
      }

      const text = this._extractText(response.data);

      logger.info('URL fetched successfully', {
        url,
        textLength: text.length
      });

      return text;

    } catch (err) {
      logger.error('Failed to fetch URL', {
        url,
        error: err.message
      });
      
      if (err.response) {
        throw new Error(`HTTP ${err.response.status}: ${err.message}`);
      } else if (err.code === 'ENOTFOUND') {
        throw new Error('URL not found or DNS resolution failed');
      } else if (err.code === 'ETIMEDOUT') {
        throw new Error('Request timeout');
      }
      
      throw new Error(`Failed to fetch: ${err.message}`);
    }
  }

  _extractText(html) {
    const $ = cheerio.load(html);
    
    $('script, style, nav, header, footer, aside').remove();
    
    const text = $('body').text()
      .replace(/\s+/g, ' ') 
      .trim();

    return text;
  }
}

export default ContentFetcher;
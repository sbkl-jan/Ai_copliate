import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';

class VectorDBManager {
  private store: MemoryVectorStore | null = null;
  private embeddings: OpenAIEmbeddings | null = null;

  private async getStore(): Promise<MemoryVectorStore> {
    if (this.store) return this.store;

    // Initialize OpenAI Embeddings with optional fallback configuration
    const apiKey = process.env.OPENAI_API_KEY || 'mock-key';
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey,
    });

    // In-memory Vector Store setup
    this.store = new MemoryVectorStore(this.embeddings);
    return this.store;
  }

  /**
   * Adds text content with associated business metadata to the Vector Database
   */
  public async addDocument(businessId: string, text: string, metadata: Record<string, any> = {}): Promise<void> {
    try {
      const store = await this.getStore();
      const doc = new Document({
        pageContent: text,
        metadata: {
          ...metadata,
          businessId,
        },
      });
      await store.addDocuments([doc]);
    } catch (error: any) {
      console.error(`Vector DB insert failure: ${error.message}`);
    }
  }

  /**
   * Performs cosine similarity matching within the Vector Database, isolated by tenant businessId
   */
  public async searchSimilarity(businessId: string, query: string, limit = 3): Promise<Document[]> {
    try {
      const store = await this.getStore();
      const results = await store.similaritySearch(query, limit * 2);
      
      // Filter results to maintain tenant isolation boundary
      return results
        .filter((doc) => doc.metadata.businessId === businessId)
        .slice(0, limit);
    } catch (error: any) {
      console.error(`Vector DB search query failure: ${error.message}`);
      return [];
    }
  }
}

const vectorDB = new VectorDBManager();
export default vectorDB;
export { VectorDBManager };

import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage, HumanMessage, BaseMessage } from '@langchain/core/messages';
import vectorDB from '../config/vector';

export interface AgentContext {
  businessId: string;
  entityId?: string; // Target user identifier
  history?: BaseMessage[];
  [key: string]: any;
}

export abstract class BaseAgent {
  public name: string;
  protected systemPrompt: string;
  protected model: ChatOpenAI | null = null;

  constructor(name: string, systemPrompt: string) {
    this.name = name;
    this.systemPrompt = systemPrompt;
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.model = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: 'gpt-4-turbo',
        temperature: 0.2,
      });
    } else {
      console.warn(`[${name}] initialized in DRY RUN mode. No OpenAI API Key found.`);
    }
  }

  /**
   * Main agent execution reasoning logic loop
   */
  public async execute(input: string, context: AgentContext): Promise<string> {
    console.log(`[Agent: ${this.name}] Executing task with prompt: "${input}"`);

    // Fetch context from Vector Long-term memory
    let memorySnippets = '';
    if (context.entityId) {
      const memories = await vectorDB.searchSimilarity(context.businessId, context.entityId, 3);
      if (memories.length > 0) {
        memorySnippets = memories.map((m) => `- Fact: ${m.pageContent}`).join('\n');
        console.log(`[Agent: ${this.name}] Loaded long-term context:\n${memorySnippets}`);
      }
    }

    const messages: BaseMessage[] = [
      new SystemMessage(
        `${this.systemPrompt}\n\nTenant Business Context ID: ${context.businessId}\n` +
        (memorySnippets ? `Retrieved memory records:\n${memorySnippets}\n` : '')
      ),
    ];

    // Append chat history if supplied
    if (context.history) {
      messages.push(...context.history);
    }

    messages.push(new HumanMessage(input));

    // Execute LLM call or dry-run
    if (this.model) {
      try {
        const response = await this.model.call(messages);
        return response.content as string;
      } catch (err: any) {
        console.error(`[Agent: ${this.name}] LLM invocation failed: ${err.message}`);
        return this.generateMockResponse(input, context);
      }
    } else {
      // Return simulated agent behavior for testing
      return this.generateMockResponse(input, context);
    }
  }

  /**
   * Generates a structural mock result for testing and key verification fallback
   */
  protected abstract generateMockResponse(input: string, context: AgentContext): string;
}

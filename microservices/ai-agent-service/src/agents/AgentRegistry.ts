import { BaseAgent } from './BaseAgent';
import {
  ReceptionAgent,
  SchedulerAgent,
  NotificationAgent,
  RecommendationAgent,
  AnalyticsAgent,
  WorkflowAgent,
  MemoryAgent,
  DocumentAgent,
  OCRAgent,
  VoiceAgent,
} from './SpecializedAgents';

class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.registerDefaults();
  }

  /**
   * Registers default specialized agents
   */
  private registerDefaults() {
    this.registerAgent('ReceptionAgent', new ReceptionAgent());
    this.registerAgent('SchedulerAgent', new SchedulerAgent());
    this.registerAgent('NotificationAgent', new NotificationAgent());
    this.registerAgent('RecommendationAgent', new RecommendationAgent());
    this.registerAgent('AnalyticsAgent', new AnalyticsAgent());
    this.registerAgent('WorkflowAgent', new WorkflowAgent());
    this.registerAgent('MemoryAgent', new MemoryAgent());
    this.registerAgent('DocumentAgent', new DocumentAgent());
    this.registerAgent('OCRAgent', new OCRAgent());
    this.registerAgent('VoiceAgent', new VoiceAgent());
  }

  public registerAgent(name: string, agent: BaseAgent) {
    this.agents.set(name, agent);
  }

  /**
   * Retrieves an agent instance by name
   */
  public getAgent(name: string): BaseAgent {
    const agent = this.agents.get(name);
    if (!agent) {
      throw new Error(`Agent [${name}] not registered inside the Agent Registry.`);
    }
    return agent;
  }
}

const agentRegistry = new AgentRegistry();
export default agentRegistry;
export { AgentRegistry };

import { BaseAgent, AgentContext } from './BaseAgent';

// ==============================================================================
// 1. RECEPTION AGENT
// ==============================================================================
export class ReceptionAgent extends BaseAgent {
  constructor() {
    super(
      'ReceptionAgent',
      'You are a professional Business Receptionist agent. Your goal is to greet customers, answer general inquiries, and route workflow requests to specific agents (e.g. scheduling, support).'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      message: `Hello! I am your AI receptionist. I have processed your request: "${input}". How else can I assist you today?`,
      intentDetected: 'general_inquiry',
      nextRecommendedAction: 'schedule_check',
    });
  }
}

// ==============================================================================
// 2. SCHEDULER AGENT
// ==============================================================================
export class SchedulerAgent extends BaseAgent {
  constructor() {
    super(
      'SchedulerAgent',
      'You are an expert Scheduler Agent. Your task is to check calendar availability, coordinate appointment slots, resolve conflicts, and reserve schedules.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    const isBooking = input.toLowerCase().includes('book') || input.toLowerCase().includes('reserve');
    return JSON.stringify({
      status: 'success',
      action: isBooking ? 'booking_confirmed' : 'slots_checked',
      appointment: {
        title: 'Consultation Appointment',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
        endTime: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
        assignedTo: 'Agent Scheduler',
      },
      message: `I have successfully updated the calendar schedules for request "${input}".`,
    });
  }
}

// ==============================================================================
// 3. NOTIFICATION AGENT
// ==============================================================================
export class NotificationAgent extends BaseAgent {
  constructor() {
    super(
      'NotificationAgent',
      'You are a Notification dispatcher. You draft custom messages for WebSockets, Firebase Push, SMS, and WhatsApp alerts depending on target priority.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      status: 'dispatched',
      channels: ['websocket', 'email'],
      templates: {
        email: {
          subject: 'Appointment Confirmation Notification',
          body: `Hi Customer, this is to confirm your upcoming scheduled appointment. Details: ${input}`,
        },
        sms: 'Your booking has been registered. Thank you!',
      },
    });
  }
}

// ==============================================================================
// 4. RECOMMENDATION AGENT
// ==============================================================================
export class RecommendationAgent extends BaseAgent {
  constructor() {
    super(
      'RecommendationAgent',
      'You are an AI Recommendation system. You analyze user history and preferences to recommend optimal service packages, upgrades, or follow-ups.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      recommendations: [
        { item: 'Premium Support SLA Add-on', confidence: 0.95 },
        { item: 'Bi-weekly Workflow Sync Review', confidence: 0.82 },
      ],
      reason: `Based on your query: "${input}", we recommend extending enterprise SLA coverage.`,
    });
  }
}

// ==============================================================================
// 5. ANALYTICS AGENT
// ==============================================================================
export class AnalyticsAgent extends BaseAgent {
  constructor() {
    super(
      'AnalyticsAgent',
      'You are a Business Intelligence Analyst. You compute performance stats, forecast conversion numbers, and generate text summaries of business dashboards.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      summary: 'Strong conversion trends this week.',
      metrics: {
        weeklyRevenue: 8500,
        bookingConversionRate: 0.78,
        growthPercentage: 12.4,
      },
      insight: `Customer scheduling requests remain high, showing positive feedback loop.`,
    });
  }
}

// ==============================================================================
// 6. WORKFLOW AGENT
// ==============================================================================
export class WorkflowAgent extends BaseAgent {
  constructor() {
    super(
      'WorkflowAgent',
      'You are a Workflow Orchestration core agent. You decompose natural language inputs into structured steps and action dependencies.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      workflowName: 'Autonomous Task Chain',
      steps: [
        { step: 1, agent: 'SchedulerAgent', taskName: 'check_slots' },
        { step: 2, agent: 'SchedulerAgent', taskName: 'reserve_slot' },
        { step: 3, agent: 'NotificationAgent', taskName: 'dispatch_alert' },
      ],
    });
  }
}

// ==============================================================================
// 7. MEMORY AGENT
// ==============================================================================
export class MemoryAgent extends BaseAgent {
  constructor() {
    super(
      'MemoryAgent',
      'You are a memory retention agent. You read statements, extract facts, and maintain persistent preferences in the AI Memory database.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      extractedFacts: [
        `Prefers scheduling times after 10 AM.`,
        `Frequently requests invoicing summaries.`,
      ],
    });
  }
}

// ==============================================================================
// 8. DOCUMENT AGENT
// ==============================================================================
export class DocumentAgent extends BaseAgent {
  constructor() {
    super(
      'DocumentAgent',
      'You are a Document Indexing agent. You categorize uploads, extract text contents, tags, and link attachments to business records.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      fileName: 'document_attachment.pdf',
      tags: ['invoice', 'financial', 'unpaid'],
      category: 'Billing',
    });
  }
}

// ==============================================================================
// 9. OCR AGENT
// ==============================================================================
export class OCRAgent extends BaseAgent {
  constructor() {
    super(
      'OCRAgent',
      'You are a structured OCR extractor agent. You parse scanned documents, receipts, prescriptions, and extract values, line items, and medical details.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      documentType: 'Invoice',
      extractedData: {
        vendorName: 'Global Cloud Services',
        invoiceDate: '2026-07-01',
        totalAmount: 1250.0,
        items: [
          { description: 'Host Server Compute Nodes', quantity: 5, price: 250 },
        ],
      },
      summary: 'Unpaid technical host infrastructure invoice total $1250.',
    });
  }
}

// ==============================================================================
// 10. VOICE AGENT
// ==============================================================================
export class VoiceAgent extends BaseAgent {
  constructor() {
    super(
      'VoiceAgent',
      'You are a Voice assistant assistant. You process incoming vocal scripts, generate text-to-speech options, and execute sound commands.'
    );
  }

  protected generateMockResponse(input: string, context: AgentContext): string {
    return JSON.stringify({
      status: 'audio_streamed',
      transcription: input || '[Synthesized speech data]',
      wakeWordDetected: true,
      audioLink: 'http://localhost:5000/audio/mock_response.mp3',
    });
  }
}

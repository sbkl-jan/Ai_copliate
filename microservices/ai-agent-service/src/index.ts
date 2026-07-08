import dotenv from 'dotenv';
import amqp from 'amqplib';
import { connectMongoDB } from './config/db';
import workflowEngine from './agents/WorkflowEngine';
import agentRegistry from './agents/AgentRegistry';
import { Document as DocumentModel } from './models';
import logger from './agents/Logger';

// Load Environment Variables
dotenv.config();

const AMQP_URL = process.env.AI_RABBITMQ_URL || process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const WORKFLOW_QUEUE = 'workflow_queue';
const OCR_QUEUE = 'ocr_queue';

const startAgentService = async () => {
  try {
    // 1. Connect MongoDB
    await connectMongoDB();

    // 2. Connect RabbitMQ
    logger.info(`AI Agent Service connecting to RabbitMQ: ${AMQP_URL}`);
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    // 3. Assert queues
    await channel.assertQueue(WORKFLOW_QUEUE, { durable: true });
    await channel.assertQueue(OCR_QUEUE, { durable: true });
    await channel.prefetch(1); // Process one message at a time

    logger.info(`AI Agent Service worker listening on [${WORKFLOW_QUEUE}] and [${OCR_QUEUE}]`);

    // 4. Consume from workflow_queue
    channel.consume(WORKFLOW_QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const rawContent = msg.content.toString();
        logger.info(`[Workflow Worker] Received payload: ${rawContent}`);
        
        const payload = JSON.parse(rawContent);
        const { workflowId } = payload;

        if (workflowId) {
          await workflowEngine.executeWorkflow(workflowId);
        }
        channel.ack(msg);
      } catch (err: any) {
        logger.error(`[Workflow Worker] Error: ${err.message}`);
        channel.nack(msg, false, false);
      }
    }, { noAck: false });

    // 5. Consume from ocr_queue
    channel.consume(OCR_QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const rawContent = msg.content.toString();
        logger.info(`[OCR Worker] Received payload: ${rawContent}`);
        
        const { documentId, businessId, storageUrl } = JSON.parse(rawContent);
        if (!documentId) {
          logger.warn('[OCR Worker] Missing documentId, skipping...');
          channel.ack(msg);
          return;
        }

        // Set status to processing
        await DocumentModel.findByIdAndUpdate(documentId, { ocrStatus: 'processing' });

        // Trigger OCR Agent
        const ocrAgent = agentRegistry.getAgent('OCRAgent');
        const extractionResult = await ocrAgent.execute(storageUrl, { businessId });

        let parsedData = {};
        let summary = 'Document processed.';
        try {
          const parsed = JSON.parse(extractionResult);
          parsedData = parsed.extractedData || {};
          summary = parsed.summary || 'Summary extracted successfully.';
        } catch {
          summary = extractionResult;
        }

        // Save OCR text, structured JSON, and summary to MongoDB
        await DocumentModel.findByIdAndUpdate(documentId, {
          ocrStatus: 'completed',
          extractedText: extractionResult,
          parsedData,
          summary,
          tags: ['ocr_processed', parsedData ? 'structured' : 'raw_text'],
        });

        logger.info(`[OCR Worker] Completed processing for document ${documentId}`);
        channel.ack(msg);
      } catch (err: any) {
        logger.error(`[OCR Worker] Error: ${err.message}`);
        channel.nack(msg, false, false);
      }
    }, { noAck: false });

    // Handle clean service closures
    const shutdown = async () => {
      logger.warn('Shutting down AI Agent worker service...');
      await channel.close();
      await connection.close();
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error: any) {
    logger.error(`Failed to launch AI Agent microservice: ${error.message}`);
    process.exit(1);
  }
};

startAgentService();

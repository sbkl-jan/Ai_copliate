import amqp, { Connection, Channel } from 'amqplib';
import logger from '../utils/logger';

class RabbitMQManager {
  private connection: any = null;
  private channel: any = null;
  private isConnecting = false;
  private reconnectInterval = 5000; // 5 seconds

  public readonly queues = {
    WORKFLOW: 'workflow_queue',
    NOTIFICATION: 'notification_queue',
    OCR: 'ocr_queue',
  };

  /**
   * Connects to RabbitMQ broker and initialises channels
   */
  public async connect(): Promise<void> {
    if (this.connection || this.isConnecting) return;
    this.isConnecting = true;

    const amqpUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

    try {
      logger.info('Connecting to RabbitMQ Broker...');
      this.connection = await amqp.connect(amqpUrl);

      this.connection.on('error', (err: any) => {
        logger.error(`RabbitMQ Connection Error: ${err.message}`);
        this.handleDisconnect();
      });

      this.connection.on('close', () => {
        logger.warn('RabbitMQ connection closed. Attempting reconnect...');
        this.handleDisconnect();
      });

      this.channel = await this.connection.createChannel();
      
      // Assert/create necessary queues
      for (const queueName of Object.values(this.queues)) {
        await this.channel.assertQueue(queueName, { durable: true });
        logger.info(`RabbitMQ Queue established: ${queueName}`);
      }

      logger.info('Successfully connected and configured RabbitMQ');
      this.isConnecting = false;
    } catch (error: any) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Publishes a message to a specific queue
   */
  public publish(queue: string, message: object): boolean {
    if (!this.channel) {
      logger.error(`Cannot publish message to queue ${queue}. RabbitMQ channel not established.`);
      return false;
    }

    try {
      const buffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.sendToQueue(queue, buffer, { persistent: true });
      if (result) {
        logger.debug(`Published task event successfully to [${queue}]`);
      }
      return result;
    } catch (error: any) {
      logger.error(`Error publishing message to queue ${queue}: ${error.message}`);
      return false;
    }
  }

  private handleDisconnect() {
    this.connection = null;
    this.channel = null;
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    logger.info(`Scheduling RabbitMQ reconnect in ${this.reconnectInterval / 1000}s`);
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }
}

const rabbitMQInstance = new RabbitMQManager();
export default rabbitMQInstance;
export { RabbitMQManager };

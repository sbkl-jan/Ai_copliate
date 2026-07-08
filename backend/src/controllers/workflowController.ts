import { Request, Response } from 'express';
import { Workflow, Task } from '../models';
import rabbitMQInstance from '../config/rabbitmq';
import logger from '../utils/logger';

export const initiateWorkflow = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const email = req.user?.role === 'customer' ? req.user.userId : req.body.email || 'customer@company.com';
    const { triggerInput } = req.body;

    if (!triggerInput) {
      return res.status(400).json({ success: false, error: 'Trigger instruction input is required' });
    }

    // 1. Create Workflow state item
    const workflow = new Workflow({
      businessId,
      initiator: {
        type: req.user?.role === 'customer' ? 'customer' : 'employee',
        id: email,
      },
      triggerInput,
      status: 'initiated',
      currentStepIndex: 0,
      steps: [],
    });
    await workflow.save();

    // 2. Queue workflow job
    const isQueued = rabbitMQInstance.publish(rabbitMQInstance.queues.WORKFLOW, {
      workflowId: workflow._id.toString(),
    });

    if (isQueued) {
      logger.info(`Successfully dispatched workflow ${workflow._id} to RabbitMQ`);
      res.status(202).json({
        success: true,
        message: 'Workflow accepted and queued for multi-agent autonomous execution',
        data: {
          workflowId: workflow._id,
          status: workflow.status,
        },
      });
    } else {
      workflow.status = 'failed';
      await workflow.save();
      logger.error(`Failed to publish workflow job to queue, cancelling transaction.`);
      res.status(500).json({ success: false, error: 'Failed to queue workflow process' });
    }
  } catch (error: any) {
    logger.error(`Initiate Workflow Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to initiate workflow process' });
  }
};

export const getWorkflowStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;

    const workflow = await Workflow.findOne({ _id: id, businessId }).populate('steps');
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow session not found' });
    }

    res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    logger.error(`Get Workflow Status Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to inspect workflow state progress' });
  }
};

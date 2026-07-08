import mongoose from 'mongoose';
import agentRegistry from './AgentRegistry';
import { Workflow, Task, Appointment, Notification } from '../models';
import logger from './Logger';

class WorkflowEngine {
  /**
   * Executes a workflow process from start to finish based on trigger input
   */
  public async executeWorkflow(workflowId: string): Promise<void> {
    try {
      logger.info(`[WorkflowEngine] Starting execution for workflow: ${workflowId}`);
      
      // 1. Fetch Workflow from Database
      const workflowDoc = await Workflow.findById(workflowId);
      if (!workflowDoc) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }

      workflowDoc.status = 'executing';
      await workflowDoc.save();

      // 2. Decompose prompt into steps using WorkflowAgent
      const workflowAgent = agentRegistry.getAgent('WorkflowAgent');
      const decompositionResult = await workflowAgent.execute(workflowDoc.triggerInput, {
        businessId: workflowDoc.businessId.toString(),
      });

      let steps: { step: number; agent: string; taskName: string }[] = [];
      try {
        const parsed = JSON.parse(decompositionResult);
        steps = parsed.steps || [];
      } catch (err) {
        logger.error('[WorkflowEngine] Decomposer response could not be parsed. Running default scheduling fallback steps.');
        // Fallback default decomposition if LLM outputs plain text
        steps = [
          { step: 1, agent: 'SchedulerAgent', taskName: 'create_appointment' },
          { step: 2, agent: 'NotificationAgent', taskName: 'dispatch_alert' },
        ];
      }

      // 3. Create Tasks in MongoDB
      const createdTaskIds: mongoose.Types.ObjectId[] = [];
      for (const step of steps) {
        const taskDoc = new Task({
          workflowId: workflowDoc._id,
          name: step.taskName,
          status: 'pending',
          assignedToAgent: step.agent,
          inputParams: {
            triggerInput: workflowDoc.triggerInput,
            initiator: workflowDoc.initiator,
          },
        });
        await taskDoc.save();
        createdTaskIds.push(taskDoc._id as mongoose.Types.ObjectId);
      }

      workflowDoc.steps = createdTaskIds;
      await workflowDoc.save();

      // 4. Sequentially execute tasks
      for (let i = 0; i < createdTaskIds.length; i++) {
        const taskId = createdTaskIds[i];
        const taskDoc = await Task.findById(taskId);
        if (!taskDoc) continue;

        workflowDoc.currentStepIndex = i;
        await workflowDoc.save();

        taskDoc.status = 'running';
        await taskDoc.save();

        try {
          logger.info(`[WorkflowEngine] Executing Step ${i+1}/${steps.length}: Agent [${taskDoc.assignedToAgent}] for task [${taskDoc.name}]`);
          const agent = agentRegistry.getAgent(taskDoc.assignedToAgent);
          
          const executionResult = await agent.execute(workflowDoc.triggerInput, {
            businessId: workflowDoc.businessId.toString(),
            entityId: workflowDoc.initiator.id,
          });

          let parsedResult = {};
          try {
            parsedResult = JSON.parse(executionResult);
          } catch {
            parsedResult = { rawText: executionResult };
          }

          taskDoc.status = 'completed';
          taskDoc.outputResult = parsedResult;
          await taskDoc.save();

          // Action hooks based on completed agent actions
          await this.processSideEffects(taskDoc, workflowDoc);

        } catch (taskError: any) {
          logger.error(`[WorkflowEngine] Task step [${taskDoc.name}] failed: ${taskError.message}`);
          taskDoc.status = 'failed';
          taskDoc.errorLog = taskError.message;
          await taskDoc.save();

          workflowDoc.status = 'failed';
          await workflowDoc.save();
          return;
        }
      }

      // 5. Complete Workflow
      workflowDoc.status = 'completed';
      await workflowDoc.save();
      logger.info(`[WorkflowEngine] Workflow ${workflowId} completed successfully!`);

    } catch (error: any) {
      logger.error(`[WorkflowEngine] Fatal crash in workflow ${workflowId}: ${error.message}`);
      await Workflow.findByIdAndUpdate(workflowId, { status: 'failed' });
    }
  }

  /**
   * Processes side-effects (e.g. writing an appointment slot to DB or triggering notifications)
   */
  private async processSideEffects(task: any, workflow: any): Promise<void> {
    const output = task.outputResult;
    if (!output) return;

    // Scheduler side effects -> Write Appointment to MongoDB
    if (task.assignedToAgent === 'SchedulerAgent' && output.action === 'booking_confirmed') {
      const apptData = output.appointment;
      const appointment = new Appointment({
        businessId: workflow.businessId,
        customerName: workflow.initiator.id.split('@')[0] || 'Web Guest',
        customerEmail: workflow.initiator.id.includes('@') ? workflow.initiator.id : 'guest@business.com',
        customerPhone: '000-000-0000',
        title: apptData.title,
        startTime: new Date(apptData.startTime),
        endTime: new Date(apptData.endTime),
        status: 'confirmed',
        source: 'chat',
        reminderSent: false,
      });
      await appointment.save();
      logger.info(`[WorkflowEngine SideEffect] Created appointment record: ${appointment._id}`);
    }

    // Notification side effects -> Write notification record to DB
    if (task.assignedToAgent === 'NotificationAgent' && task.status === 'completed') {
      const notification = new Notification({
        businessId: workflow.businessId,
        recipientId: new mongoose.Types.ObjectId(), // Simulated manager or recipient user
        title: 'Workflow Notice: Scheduler Action',
        body: `Your task workflow has run successfully: ${workflow.triggerInput}`,
        type: 'appointment',
        priority: 'medium',
        status: 'unread',
        channels: ['websocket'],
      });
      await notification.save();
      logger.info(`[WorkflowEngine SideEffect] Saved notification alert: ${notification._id}`);
    }
  }
}

const workflowEngine = new WorkflowEngine();
export default workflowEngine;
export { WorkflowEngine };

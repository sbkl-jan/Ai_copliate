import { Request, Response } from 'express';
import { Notification } from '../models';
import logger from '../utils/logger';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const { status } = req.query;

    const query: any = {
      businessId,
      recipientId: userId,
    };

    if (status) {
      query.status = status;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error: any) {
    logger.error(`Get Notifications Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, businessId, recipientId: userId },
      { $set: { status: 'read' } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification alert not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    logger.error(`Mark Notification Read Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update notification state' });
  }
};

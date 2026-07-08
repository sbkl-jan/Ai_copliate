import { Request, Response } from 'express';
import { Document } from '../models';
import rabbitMQInstance from '../config/rabbitmq';
import logger from '../utils/logger';

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const documents = await Document.find({ businessId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: documents });
  } catch (error: any) {
    logger.error(`Get Documents Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve documents' });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;

    const doc = await Document.findOne({ _id: id, businessId });
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.status(200).json({ success: true, data: doc });
  } catch (error: any) {
    logger.error(`Get Document By ID Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve document metadata' });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;
    const { fileName, fileSize, fileType, storageUrl } = req.body;

    if (!fileName || !fileSize || !fileType || !storageUrl) {
      return res.status(400).json({ success: false, error: 'Missing required file attachment metadata' });
    }

    const doc = new Document({
      businessId,
      uploadedBy: userId,
      fileName,
      fileSize,
      fileType,
      storageUrl,
      ocrStatus: 'pending',
      tags: [],
    });
    await doc.save();

    // Publish OCR task trigger to RabbitMQ Queue
    const published = rabbitMQInstance.publish(rabbitMQInstance.queues.OCR, {
      documentId: doc._id.toString(),
      businessId: businessId?.toString(),
      storageUrl,
    });

    if (published) {
      logger.info(`Queued OCR processing task for document: ${doc._id}`);
    } else {
      logger.warn(`Failed to queue OCR task, document ${doc._id} will remain pending.`);
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded and queued for AI OCR processing',
      data: doc,
    });
  } catch (error: any) {
    logger.error(`Upload Document Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to create document record' });
  }
};

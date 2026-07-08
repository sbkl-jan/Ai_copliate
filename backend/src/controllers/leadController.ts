import { Request, Response } from 'express';
import { Lead } from '../models';
import logger from '../utils/logger';

export const getLeads = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const { status, priority, search } = req.query;

    const query: any = { businessId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const leads = await Lead.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (error: any) {
    logger.error(`Get Leads Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve sales lead metrics' });
  }
};

export const getLeadById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;

    const lead = await Lead.findOne({ _id: id, businessId });
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error: any) {
    logger.error(`Get Lead By ID Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve lead data details' });
  }
};

export const createLead = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const { name, email, phone, source, value, priority, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required fields' });
    }

    const lead = new Lead({
      businessId,
      name,
      email,
      phone,
      source: source || 'manual',
      value: value || 0,
      priority: priority || 'medium',
      status: status || 'new',
      notes: [],
      aiSuggestions: [
        'Schedule introductory workflow demo',
        'Verify target SaaS module requirements',
      ],
    });
    await lead.save();

    res.status(201).json({ success: true, data: lead });
  } catch (error: any) {
    logger.error(`Create Lead Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to record prospect lead details' });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;
    const updateFields = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: id, businessId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error: any) {
    logger.error(`Update Lead Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to modify prospect lead state' });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;

    const result = await Lead.deleteOne({ _id: id, businessId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Lead record not found' });
    }

    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error: any) {
    logger.error(`Delete Lead Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to delete lead from pipeline' });
  }
};

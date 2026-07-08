import { Request, Response } from 'express';
import { User, Appointment, AIMemory } from '../models';
import logger from '../utils/logger';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const { search, limit = 10, page = 1 } = req.query;

    const query: any = {
      businessId,
      role: 'customer',
    };

    // Text search query filter
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
      ];
    }

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error(`Get Customers Controller Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to fetch customer directory records' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;

    const customer = await User.findOne({ _id: id, businessId, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Fetch related items: Appointments and AI Memory facts
    const appointments = await Appointment.find({ businessId, customerEmail: customer.email })
      .sort({ startTime: -1 });
      
    const aiMemory = await AIMemory.findOne({ businessId, entityId: customer.email });

    res.status(200).json({
      success: true,
      data: {
        customer,
        appointments,
        aiMemory: aiMemory || { facts: [], preferences: {} },
      },
    });
  } catch (error: any) {
    logger.error(`Get Customer By ID Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve profile record details' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const { email, firstName, lastName, phoneNumber } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'Name and email fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const customer = new User({
      businessId,
      email,
      firstName,
      lastName,
      phoneNumber,
      role: 'customer',
    });
    await customer.save();

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    logger.error(`Create Customer Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to register customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;
    const { firstName, lastName, phoneNumber, isActive } = req.body;

    const customer = await User.findOneAndUpdate(
      { _id: id, businessId, role: 'customer' },
      { $set: { firstName, lastName, phoneNumber, isActive } },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    logger.error(`Update Customer Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update customer record' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;

    // We do a soft-delete (deactivate) or delete depending on business standard
    const customer = await User.findOneAndUpdate(
      { _id: id, businessId, role: 'customer' },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer profile record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Customer record deactivated successfully',
    });
  } catch (error: any) {
    logger.error(`Delete Customer Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to delete customer' });
  }
};

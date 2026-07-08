import { Request, Response } from 'express';
import { Appointment } from '../models';
import logger from '../utils/logger';
import axios from 'axios';

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const { start, end } = req.query;

    const query: any = { businessId };
    
    if (start && end) {
      query.startTime = { $gte: new Date(start as string) };
      query.endTime = { $lte: new Date(end as string) };
    }

    const appointments = await Appointment.find(query).sort({ startTime: 1 });
    res.status(200).json({ success: true, data: appointments });
  } catch (error: any) {
    logger.error(`Get Appointments Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to retrieve appointments' });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const businessId = req.user?.businessId;
    const { customerName, customerEmail, customerPhone, title, startTime, endTime, assignedTo, source } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Missing required scheduling inputs' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ success: false, error: 'Start time must be before end time' });
    }

    let isConflict = false;

    // 1. Try checking conflict via the Spring Boot Microservice
    try {
      const response = await axios.post(`${SPRING_BOOT_URL}/api/appointments/check-conflict`, {
        businessId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      isConflict = response.data.hasConflict;
    } catch (springErr: any) {
      logger.warn(`Spring Boot service unavailable (${springErr.message}). Performing local MongoDB fallback conflict check.`);
      // 2. Fallback: Run local query in MongoDB
      const overlappingAppt = await Appointment.findOne({
        businessId,
        status: { $ne: 'cancelled' },
        startTime: { $lt: end },
        endTime: { $gt: start },
      });
      isConflict = !!overlappingAppt;
    }

    if (isConflict) {
      return res.status(409).json({
        success: false,
        error: 'Scheduling conflict detected. The requested time slot is already reserved.',
      });
    }

    // Save Appointment
    const appointment = new Appointment({
      businessId,
      customerName,
      customerEmail,
      customerPhone,
      title,
      startTime: start,
      endTime: end,
      assignedTo,
      source: source || 'manual',
    });
    await appointment.save();

    res.status(201).json({ success: true, data: appointment });
  } catch (error: any) {
    logger.error(`Create Appointment Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to schedule appointment' });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const businessId = req.user?.businessId;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled', 'no-show', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid scheduling status state' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: id, businessId },
      { $set: { status } },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error: any) {
    logger.error(`Update Appointment Status Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Failed to update appointment record' });
  }
};

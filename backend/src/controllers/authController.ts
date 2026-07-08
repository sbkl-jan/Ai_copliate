import { Request, Response } from 'express';
import { User, Business, Session } from '../models';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { firebaseApp } from '../config/firebase';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, businessName, businessId } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'Email and names are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    let targetBusinessId = businessId;

    // SaaS Multi-tenant onboarding: Create business if signing up from scratch
    if (!targetBusinessId) {
      if (!businessName) {
        return res.status(400).json({ success: false, error: 'Business name is required to register a new account' });
      }
      const newBusiness = new Business({
        name: businessName,
        subscriptionPlan: 'free',
      });
      await newBusiness.save();
      targetBusinessId = newBusiness._id;
      logger.info(`Onboarded new business tenant: ${businessName} (${targetBusinessId})`);
    }

    const user = new User({
      businessId: targetBusinessId,
      email,
      firstName,
      lastName,
      role: businessId ? 'employee' : 'admin', // Admin if creator of the business
    });

    if (password) {
      user.setPassword(password);
    }
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
      },
    });
  } catch (error: any) {
    logger.error(`Registration Controller Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isActive || !user.comparePassword(password)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or inactive account' });
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      businessId: user.businessId.toString(),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh session to database
    const session = new Session({
      userId: user._id,
      refreshToken,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching token
    });
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          businessId: user.businessId,
        },
      },
    });
  } catch (error: any) {
    logger.error(`Login Controller Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    // Verify session in database
    const activeSession = await Session.findOne({ refreshToken });
    if (!activeSession) {
      return res.status(401).json({ success: false, error: 'Session expired or invalidated' });
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const accessToken = generateAccessToken({
        userId: decoded.userId,
        role: decoded.role,
        businessId: decoded.businessId,
      });

      res.status(200).json({
        success: true,
        data: { accessToken },
      });
    } catch (tokenErr) {
      await Session.deleteOne({ _id: activeSession._id });
      return res.status(401).json({ success: false, error: 'Invalid token signature, please sign in again' });
    }
  } catch (error: any) {
    logger.error(`Refresh Controller Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Token refresh process failed' });
  }
};

export const firebaseSSO = async (req: Request, res: Response) => {
  try {
    const { firebaseToken, businessName } = req.body;
    if (!firebaseToken) {
      return res.status(400).json({ success: false, error: 'Firebase ID Token is required' });
    }

    if (!firebaseApp) {
      return res.status(400).json({ success: false, error: 'Firebase Auth integrations are not active on this host server' });
    }

    const decodedToken = await firebaseApp.auth().verifyIdToken(firebaseToken);
    const { email, uid, name } = decodedToken;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email field is required from OAuth payload' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create a business if user does not exist yet
      const finalBusinessName = businessName || `${name || email.split('@')[0]}'s Operations`;
      const business = new Business({
        name: finalBusinessName,
        subscriptionPlan: 'free',
      });
      await business.save();

      const splitName = name ? name.split(' ') : ['OAuth', 'User'];
      user = new User({
        businessId: business._id,
        email,
        firebaseUid: uid,
        firstName: splitName[0],
        lastName: splitName[1] || '',
        role: 'admin',
      });
      await user.save();
      logger.info(`Onboarded new Firebase Google SSO business user: ${email}`);
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
      businessId: user.businessId.toString(),
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const session = new Session({
      userId: user._id,
      refreshToken,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          businessId: user.businessId,
        },
      },
    });
  } catch (error: any) {
    logger.error(`Firebase SSO Exchange Error: ${error.message}`);
    res.status(500).json({ success: false, error: 'Single sign-on validation failed' });
  }
};

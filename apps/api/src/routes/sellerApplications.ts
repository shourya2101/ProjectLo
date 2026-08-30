import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { Role, ApplicationStatus } from '@prisma/client';

const router = Router();

const applicationSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name cannot exceed 100 characters'),
  email: z.string().trim().email('Please provide a valid email address'),
  phone: z.string().trim().min(5, 'Phone number must be at least 5 digits').max(25, 'Phone number cannot exceed 25 characters'),
  institution: z.string().trim().min(2, 'College / Institution name is required').max(150, 'Institution name is too long'),
  about: z.string().trim().min(3, 'Please provide a short description about yourself').max(1500, 'About description cannot exceed 1500 characters'),
  reason: z.string().trim().min(3, 'Please specify what you plan to sell or rent').max(1500, 'Reason cannot exceed 1500 characters'),
  studentProof: z.string().trim().optional().nullable().or(z.literal('')),
});

// POST /api/seller-applications
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (user.role === Role.SELLER || user.role === Role.ADMIN) {
      return res.status(400).json({ error: 'You are already an approved seller or admin.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Your account is currently suspended from submitting applications.' });
    }

    // Check if there is an existing pending application
    const existingPending = await prisma.sellerApplication.findFirst({
      where: {
        userId: user.id,
        status: ApplicationStatus.PENDING,
      }
    });

    if (existingPending) {
      return res.status(400).json({ 
        error: 'You already have a seller application under review.',
        application: existingPending
      });
    }

    const validatedData = applicationSchema.parse(req.body);

    const application = await prisma.sellerApplication.create({
      data: {
        userId: user.id,
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        institution: validatedData.institution,
        about: validatedData.about,
        reason: validatedData.reason,
        studentProof: validatedData.studentProof && validatedData.studentProof.trim() !== '' ? validatedData.studentProof.trim() : null,
        status: ApplicationStatus.PENDING,
      }
    });

    res.status(201).json(application);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      const errorMessage = firstIssue?.message || 'Please check the form for invalid inputs.';
      return res.status(400).json({ error: errorMessage, details: error.issues });
    }
    console.error('Error submitting seller application:', error);
    res.status(500).json({ error: 'Failed to process application. Please try again.' });
  }
});

// GET /api/seller-applications/my
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const applications = await prisma.sellerApplication.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(applications);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

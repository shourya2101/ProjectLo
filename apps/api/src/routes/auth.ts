import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../server.js';

const router = Router();

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Fetch latest seller application if exists
    const latestApplication = await prisma.sellerApplication.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        institution: user.institution,
        department: user.department,
        role: user.role,
        isSuspended: user.isSuspended,
        suspendedReason: user.suspendedReason,
        rating: user.rating,
        completedDeals: user.completedDeals,
        createdAt: user.createdAt,
      },
      latestApplication: latestApplication ? {
        id: latestApplication.id,
        status: latestApplication.status,
        rejectionReason: latestApplication.rejectionReason,
        createdAt: latestApplication.createdAt,
        reviewedAt: latestApplication.reviewedAt,
      } : null
    });
  } catch (error) {
    console.error('Error fetching auth user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

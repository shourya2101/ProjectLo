import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/rentals (Fetch logged-in user's active and past rentals)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const rentals = await prisma.rental.findMany({
      where: {
        renterId: req.userId,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
                institution: true,
                department: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(rentals);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

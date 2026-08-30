import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { Role, ApplicationStatus, ProductStatus } from '@prisma/client';

const router = Router();
router.use(authenticate);
router.use(requireAdmin);

const reviewApplicationSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional().nullable(),
});

const reviewProductSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional().nullable(),
});

const suspendSellerSchema = z.object({
  isSuspended: z.boolean(),
  reason: z.string().optional().nullable(),
});

// GET /api/admin/stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [
      pendingApplications,
      approvedSellers,
      pendingListings,
      approvedListings,
      rejectedListings,
      totalUsers,
    ] = await Promise.all([
      prisma.sellerApplication.count({ where: { status: ApplicationStatus.PENDING } }),
      prisma.user.count({ where: { role: Role.SELLER } }),
      prisma.product.count({ where: { status: ProductStatus.PENDING_REVIEW } }),
      prisma.product.count({ where: { status: ProductStatus.APPROVED } }),
      prisma.product.count({ where: { status: ProductStatus.REJECTED } }),
      prisma.user.count(),
    ]);

    res.json({
      pendingApplications,
      approvedSellers,
      pendingListings,
      approvedListings,
      rejectedListings,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/applications
router.get('/applications', async (req: AuthRequest, res) => {
  try {
    const status = req.query.status as ApplicationStatus | undefined;
    const where: any = {};
    if (status && Object.values(ApplicationStatus).includes(status)) {
      where.status = status;
    }

    const applications = await prisma.sellerApplication.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            institution: true,
            department: true,
            role: true,
            isSuspended: true,
            rating: true,
            completedDeals: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/applications/:id/review
router.post('/applications/:id/review', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const adminId = req.userId!;
    const { action, rejectionReason } = reviewApplicationSchema.parse(req.body);

    const application = await prisma.sellerApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Seller application not found' });
    }

    if (action === 'APPROVE') {
      const [updatedApp, updatedUser] = await prisma.$transaction([
        prisma.sellerApplication.update({
          where: { id },
          data: {
            status: ApplicationStatus.APPROVED,
            reviewedBy: adminId,
            reviewedAt: new Date(),
            rejectionReason: null,
          }
        }),
        prisma.user.update({
          where: { id: application.userId },
          data: {
            role: Role.SELLER,
            institution: application.institution,
          }
        })
      ]);

      return res.json({
        message: 'Seller application approved successfully',
        application: updatedApp,
        user: updatedUser,
      });
    } else {
      const updatedApp = await prisma.sellerApplication.update({
        where: { id },
        data: {
          status: ApplicationStatus.REJECTED,
          reviewedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || 'Application did not meet verification requirements.',
        }
      });

      return res.json({
        message: 'Seller application rejected',
        application: updatedApp,
      });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation failed', details: error.issues });
    }
    console.error('Error reviewing application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/sellers/:id/suspend
router.post('/sellers/:id/suspend', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { isSuspended, reason } = suspendSellerSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === Role.ADMIN) {
      return res.status(400).json({ error: 'Cannot suspend an admin account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isSuspended,
        suspendedReason: isSuspended ? (reason || 'Selling privileges suspended by administrator.') : null,
      }
    });

    res.json({
      message: isSuspended ? 'Seller suspended successfully' : 'Seller unsuspended successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation failed', details: error.issues });
    }
    console.error('Error suspending seller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/products
router.get('/products', async (req: AuthRequest, res) => {
  try {
    const status = req.query.status as ProductStatus | undefined;
    const where: any = {};
    if (status && Object.values(ProductStatus).includes(status)) {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            institution: true,
            department: true,
            role: true,
            isSuspended: true,
            rating: true,
            completedDeals: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/products/:id/review
router.post('/products/:id/review', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const { action, rejectionReason } = reviewProductSchema.parse(req.body);

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product listing not found' });
    }

    if (action === 'APPROVE') {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          status: ProductStatus.APPROVED,
          rejectionReason: null,
        }
      });

      return res.json({
        message: 'Product listing approved and published',
        product: updatedProduct,
      });
    } else {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          status: ProductStatus.REJECTED,
          rejectionReason: rejectionReason || 'Listing violates platform moderation standards.',
        }
      });

      return res.json({
        message: 'Product listing rejected',
        product: updatedProduct,
      });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation failed', details: error.issues });
    }
    console.error('Error reviewing product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

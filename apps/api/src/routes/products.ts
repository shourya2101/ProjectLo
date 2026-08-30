import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { authenticate, requireSeller, getSupabaseClient, AuthRequest } from '../middleware/auth.js';
import { InventoryType, ProductType, ProductStatus, Role } from '@prisma/client';

const router = Router();

const baseProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description is too long'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().nullable(),
  inventoryType: z.nativeEnum(InventoryType),
  type: z.nativeEnum(ProductType),
  priceSalePaise: z.number().int().min(0).optional().nullable(),
  priceRentPaise: z.number().int().min(0).optional().nullable(),
  securityDepositPaise: z.number().int().min(0).optional().nullable(),
  image: z.string().url().optional().nullable(),
});

const productSchema = baseProductSchema.refine(data => {
  if (data.type === 'SALE' && (data.priceSalePaise == null || data.priceSalePaise <= 0)) {
    return false;
  }
  return true;
}, { message: "priceSalePaise is required and must be > 0 for SALE type", path: ["priceSalePaise"] })
.refine(data => {
  if (data.type === 'RENT' && (data.priceRentPaise == null || data.priceRentPaise <= 0)) {
    return false;
  }
  return true;
}, { message: "priceRentPaise is required and must be > 0 for RENT type", path: ["priceRentPaise"] })
.refine(data => {
  if (data.type === 'BOTH') {
    if (data.priceSalePaise == null || data.priceSalePaise <= 0 || data.priceRentPaise == null || data.priceRentPaise <= 0) {
      return false;
    }
  }
  return true;
}, { message: "Both sale and rent prices must be > 0 for BOTH type", path: ["type"] });

const updateProductSchema = baseProductSchema.partial();

// GET /api/products (Public: strictly APPROVED listings only)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string;
    const category = req.query.category as string;
    const type = req.query.type as ProductType;

    const where: any = { 
      status: ProductStatus.APPROVED,
      seller: {
        isSuspended: false
      }
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              department: true,
              institution: true,
              rating: true,
              completedDeals: true,
              role: true,
              isSuspended: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/categories (Public: count only APPROVED listings)
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        status: ProductStatus.APPROVED,
        seller: {
          isSuspended: false
        }
      }
    });

    res.json(categories.map(c => ({
      name: c.category,
      count: c._count.category,
    })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/seller/stats (Seller Dashboard metrics)
router.get('/seller/stats', authenticate, requireSeller, async (req: AuthRequest, res) => {
  try {
    const sellerId = req.userId!;
    const [total, approved, pending, rejected] = await Promise.all([
      prisma.product.count({ where: { sellerId } }),
      prisma.product.count({ where: { sellerId, status: ProductStatus.APPROVED } }),
      prisma.product.count({ where: { sellerId, status: ProductStatus.PENDING_REVIEW } }),
      prisma.product.count({ where: { sellerId, status: ProductStatus.REJECTED } }),
    ]);

    res.json({
      totalListings: total,
      approvedListings: approved,
      pendingListings: pending,
      rejectedListings: rejected,
      completedDeals: req.user?.completedDeals || 0,
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/my (Authenticated: seller's own listings)
router.get('/my', authenticate, async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching my products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products/:id (Public for APPROVED, Owner/Admin for PENDING_REVIEW / REJECTED)
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            institution: true,
            rating: true,
            completedDeals: true,
            role: true,
            isSuspended: true,
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If product is APPROVED, it's public
    if (product.status === ProductStatus.APPROVED) {
      return res.json(product);
    }

    // Otherwise, require authentication and verify user is owner or admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      return res.status(404).json({ error: 'Product not found' });
    }
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser(token);
    if (!data.user) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: data.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId === user.id || user.role === Role.ADMIN) {
      return res.json(product);
    }

    return res.status(404).json({ error: 'Product not found' });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products (Seller only: creates listing with PENDING_REVIEW)
router.post('/', authenticate, requireSeller, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const validatedData = productSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        sellerId: user.id,
        status: ProductStatus.PENDING_REVIEW,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation failed', details: error.issues });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/products/:id (Seller only: updates own listing)
router.put('/:id', authenticate, requireSeller, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.sellerId !== req.userId && req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Forbidden: You do not own this product' });
    }

    const validatedData = updateProductSchema.parse(req.body);

    // Prevent overriding sensitive fields
    delete (validatedData as any).sellerId;
    delete (validatedData as any).status;
    delete (validatedData as any).rejectionReason;

    // If updating a previously rejected product, send back to PENDING_REVIEW
    const dataToUpdate: any = { ...validatedData };
    if (product.status === ProductStatus.REJECTED) {
      dataToUpdate.status = ProductStatus.PENDING_REVIEW;
      dataToUpdate.rejectionReason = null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updatedProduct);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation failed', details: error.issues });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id (Seller or Admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        orders: true,
        rentals: true,
        conversations: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId !== req.userId && req.user?.role !== Role.ADMIN) {
      return res.status(403).json({ error: 'Forbidden: You do not own this product' });
    }

    // Check if there are related orders, rentals, or conversations
    if (product.orders.length > 0 || product.rentals.length > 0 || product.conversations.length > 0) {
      // Soft delete by updating status
      await prisma.product.update({
        where: { id },
        data: { status: ProductStatus.DELETED }
      });
      return res.json({ message: 'Product archived due to existing relationships.' });
    }

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

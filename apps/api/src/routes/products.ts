import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { InventoryType, ProductType, OrderStatus, RentalStatus } from '@prisma/client';

const router = Router();

const productSchema = z.object({
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
}).refine(data => {
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

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = req.query.search as string;
    const category = req.query.category as string;
    const type = req.query.type as ProductType;

    const where: any = { status: 'Available' };

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
              rating: true,
              completedDeals: true,
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

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        status: 'Available',
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

// GET /api/products/my
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

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            rating: true,
            completedDeals: true,
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/products
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(403).json({ error: 'User does not exist in database.' });
    }

    const validatedData = productSchema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        sellerId: req.userId!,
        status: 'Available',
      },
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this product' });
    }

    const validatedData = productSchema.partial().parse(req.body);

    // Prevent overriding sellerId
    if ('sellerId' in validatedData) {
      delete (validatedData as any).sellerId;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: validatedData,
    });

    res.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.findUnique({ 
      where: { id: req.params.id },
      include: {
        orders: true,
        rentals: true,
        conversations: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId !== req.userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this product' });
    }

    // Check if there are related orders, rentals, or conversations
    if (product.orders.length > 0 || product.rentals.length > 0 || product.conversations.length > 0) {
      // Soft delete by updating status
      await prisma.product.update({
        where: { id: req.params.id },
        data: { status: 'Deleted' }
      });
      return res.json({ message: 'Product archived due to existing relationships.' });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

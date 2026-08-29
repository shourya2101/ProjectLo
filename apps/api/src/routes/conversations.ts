import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { ConversationStatus, OrderStatus } from '@prisma/client';

const router = Router();
router.use(authenticate);

// 4. GET CONVERSATIONS
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            image: true,
            priceSalePaise: true,
            priceRentPaise: true,
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        order: {
          select: {
            id: true,
            status: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// 3. CONVERSATION CREATION
router.post('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { productId } = req.body; // Expect frontend to send productId

  if (!productId) return res.status(400).json({ error: 'productId is required' });

  try {
    // Determine the seller from the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true }
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.sellerId === userId) {
      return res.status(400).json({ error: 'You cannot contact yourself about your own product' });
    }

    const partnerId = product.sellerId;

    // Canonical order
    const user1Id = userId < partnerId ? userId : partnerId;
    const user2Id = userId < partnerId ? partnerId : userId;

    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id_productId: {
          user1Id,
          user2Id,
          productId
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
          productId,
          status: 'ACTIVE'
        }
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// 5. GET MESSAGES
router.get('/:id/messages', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;
  // Pagination
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined;
  const take = Number(req.query.take) || 50;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: id as string }
    });

    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id as string },
      orderBy: { createdAt: 'asc' },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {})
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 10. COMPLETE ORDER ENDPOINT
router.post('/:id/complete-order', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

  try {
    // 3. Retrieve the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id }
    });

    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    
    // 2. Verify user belongs to conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    // 4. Retrieve the explicitly associated order
    const orderId = conversation.orderId;
    if (!orderId) {
      return res.status(409).json({ error: 'No associated order found for this conversation' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // 5. Verify the order belongs to the authenticated user's allowed role.
    const product = await prisma.product.findUnique({ where: { id: order.productId } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (order.buyerId !== userId && product.sellerId !== userId) {
       return res.status(403).json({ error: 'Unauthorized to complete this order' });
    }

    // 6. Verify the order is in a state that can be completed
    if (order.status === 'COMPLETED') {
       return res.status(409).json({ error: 'Order is already completed' });
    }

    // 7, 8, 9. Perform related updates in a database transaction
    const [updatedOrder, updatedConversation] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' }
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: 'COMPLETED' }
      })
    ]);

    // 10. Return the updated order and conversation status.
    res.json({
      order: updatedOrder,
      conversation: updatedConversation
    });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

export default router;

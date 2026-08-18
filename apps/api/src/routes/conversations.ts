import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

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
        product: true,
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

router.post('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const { partnerId, productId } = req.body;

  if (!partnerId) return res.status(400).json({ error: 'partnerId is required' });

  // Canonical order
  const user1Id = userId < partnerId ? userId : partnerId;
  const user2Id = userId < partnerId ? partnerId : userId;

  try {
    let conversation = await prisma.conversation.findUnique({
      where: {
        user1Id_user2Id_productId: {
          user1Id,
          user2Id,
          productId: productId || ''
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
          productId
        }
      });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.get('/:id/messages', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.userId!;

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
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;

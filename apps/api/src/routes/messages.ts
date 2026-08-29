import { Router } from 'express';
import { prisma } from '../server.js';
import { authenticate } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// 6. SEND MESSAGE
router.post('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  let { conversationId, content } = req.body;

  if (!conversationId || !content) {
    return res.status(400).json({ error: 'conversationId and content are required' });
  }

  content = String(content).trim();
  if (content.length === 0) {
    return res.status(422).json({ error: 'Message content cannot be empty' });
  }
  if (content.length > 2000) {
    return res.status(422).json({ error: 'Message exceeds maximum length of 2000 characters' });
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    // Reject messages if the conversation is COMPLETED/CLOSED
    if (conversation.status === 'COMPLETED' || conversation.status === 'CLOSED') {
      return res.status(403).json({ error: 'This conversation is closed/completed and read-only.' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId, // Backend derives senderId from authenticated user
        content
      }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    res.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;

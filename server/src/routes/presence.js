import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// POST /api/documents/:id/presence - heartbeat when user is active on document
router.post('/:id/presence', async (req, res) => {
  const docId = parseInt(req.params.id, 10);
  const { userId, userName } = req.body;
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(docId) || isNaN(parsedUserId) || !userName) {
    return res.status(400).json({ error: 'Valid docId, userId, and userName are required' });
  }

  try {
    await prisma.userPresence.upsert({
      where: {
        documentId_userId: {
          documentId: docId,
          userId: parsedUserId,
        },
      },
      update: {
        userName,
        updatedAt: new Date(),
      },
      create: {
        documentId: docId,
        userId: parsedUserId,
        userName,
      },
    });

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error recording presence:', error);
    res.status(500).json({ error: 'Failed to record presence' });
  }
});

// GET /api/documents/:id/presence?userId=1 - fetch active co-editors (updated within last 5 seconds)
router.get('/:id/presence', async (req, res) => {
  const docId = parseInt(req.params.id, 10);
  const currentUserId = parseInt(req.query.userId, 10);

  if (isNaN(docId) || isNaN(currentUserId)) {
    return res.status(400).json({ error: 'Valid docId and userId query parameter required' });
  }

  try {
    const threshold = new Date(Date.now() - 5000); // 5 seconds ago

    const activePresences = await prisma.userPresence.findMany({
      where: {
        documentId: docId,
        userId: { not: currentUserId },
        updatedAt: { gte: threshold },
      },
      select: {
        userId: true,
        userName: true,
      },
    });

    res.json({ coEditors: activePresences });
  } catch (error) {
    console.error('Error fetching presence:', error);
    res.status(500).json({ error: 'Failed to fetch presence' });
  }
});

export default router;

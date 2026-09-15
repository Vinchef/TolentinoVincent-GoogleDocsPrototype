import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// POST /api/documents/:id/share
router.post('/:id/share', async (req, res) => {
  const docId = parseInt(req.params.id, 10);
  const { userId, ownerId } = req.body;
  const targetUserId = parseInt(userId, 10);
  const requestOwnerId = parseInt(ownerId, 10);

  if (isNaN(docId) || isNaN(targetUserId) || isNaN(requestOwnerId)) {
    return res.status(400).json({ error: 'Valid document ID, target user ID, and owner ID are required.' });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: docId },
      include: {
        shares: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.ownerId !== requestOwnerId) {
      return res.status(403).json({ error: 'Only the document owner can share this document.' });
    }

    if (targetUserId === requestOwnerId) {
      return res.status(400).json({ error: 'You are already the owner of this document.' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found.' });
    }

    const existingShare = document.shares.find((s) => s.userId === targetUserId);
    if (existingShare) {
      return res.status(400).json({ error: `This document is already shared with ${targetUser.name}.` });
    }

    const share = await prisma.documentShare.create({
      data: {
        documentId: docId,
        userId: targetUserId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        document: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({
      message: `Document shared with ${targetUser.name} ✓`,
      share,
    });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

export default router;

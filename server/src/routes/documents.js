import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/documents?userId=1
router.get('/', async (req, res) => {
  const userId = parseInt(req.query.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Valid userId query parameter is required' });
  }

  try {
    const owned = await prisma.document.findMany({
      where: { ownerId: userId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const shares = await prisma.documentShare.findMany({
      where: { userId },
      include: {
        document: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const shared = shares.map((s) => s.document);

    res.json({ owned, shared });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/documents - create document
router.post('/', async (req, res) => {
  const { title, content, ownerId } = req.body;
  const parsedOwnerId = parseInt(ownerId, 10);

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Document title cannot be empty.' });
  }
  if (isNaN(parsedOwnerId)) {
    return res.status(400).json({ error: 'Valid ownerId is required.' });
  }

  try {
    const document = await prisma.document.create({
      data: {
        title: title.trim(),
        content: content || JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        ownerId: parsedOwnerId,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// GET /api/documents/:id?userId=1
router.get('/:id', async (req, res) => {
  const docId = parseInt(req.params.id, 10);
  const userId = parseInt(req.query.userId, 10);

  if (isNaN(docId) || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid document ID or user ID' });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: docId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const isOwner = document.ownerId === userId;
    const isShared = document.shares.some((share) => share.userId === userId);

    if (!isOwner && !isShared) {
      return res.status(403).json({ error: 'You do not have access to this document.' });
    }

    res.json({
      ...document,
      isOwner,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// PUT /api/documents/:id - update document content/title
router.put('/:id', async (req, res) => {
  const docId = parseInt(req.params.id, 10);
  const { title, content, userId } = req.body;
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(docId) || isNaN(parsedUserId)) {
    return res.status(400).json({ error: 'Invalid document ID or user ID' });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: docId },
      include: { shares: true },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const isOwner = document.ownerId === parsedUserId;
    const isShared = document.shares.some((share) => share.userId === parsedUserId);

    if (!isOwner && !isShared) {
      return res.status(403).json({ error: 'You do not have access to edit this document.' });
    }

    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (title !== undefined) {
      if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Document title cannot be empty.' });
      }
      updateData.title = title.trim();
    }

    const updatedDocument = await prisma.document.update({
      where: { id: docId },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Unable to save document. Please try again.' });
  }
});

// PATCH /api/documents/:id - rename document (owner only)
router.patch('/:id', async (req, res) => {
  const docId = parseInt(req.params.id, 10);
  const { title, userId } = req.body;
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(docId) || isNaN(parsedUserId)) {
    return res.status(400).json({ error: 'Invalid document ID or user ID' });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Document title cannot be empty.' });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    if (document.ownerId !== parsedUserId) {
      return res.status(403).json({ error: 'Only the owner can rename this document.' });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: docId },
      data: { title: title.trim() },
    });

    res.json(updatedDocument);
  } catch (error) {
    console.error('Error renaming document:', error);
    res.status(500).json({ error: 'Failed to rename document' });
  }
});

export default router;

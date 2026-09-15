import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /api/users - list seeded users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['vincent@example.com', 'alex@example.com'],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;

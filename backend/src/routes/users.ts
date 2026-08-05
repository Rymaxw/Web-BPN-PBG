import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna.' });
  }
});

// PUT /api/users/:id/role
router.put('/:id/role', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || (role !== 'admin' && role !== 'staff')) {
      res.status(400).json({ error: 'Role tidak valid.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengubah role pengguna.' });
  }
});

export default router;

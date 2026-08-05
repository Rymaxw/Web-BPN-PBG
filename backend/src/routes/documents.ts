import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/documents - Ambil semua dokumen (dengan filter opsional)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { tipe, status } = req.query;

    const where: Record<string, string> = {};
    if (tipe) where.tipe = tipe as string;
    if (status) where.status = status as string;

    const documents = await prisma.document.findMany({
      where,
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// POST /api/documents - Buat dokumen baru
router.post('/', async (req: Request, res: Response) => {
  try {
    const { noBerkas, judul, lokasi, tipe, status, klasifikasi, keamanan, authorId } = req.body;

    if (!noBerkas || !tipe || !authorId) {
      res.status(400).json({ error: 'noBerkas, tipe, dan authorId wajib diisi.' });
      return;
    }

    const document = await prisma.document.create({
      data: { noBerkas, judul, lokasi, tipe, status, klasifikasi, keamanan, authorId },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// GET /api/documents/stats - Statistik dashboard
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { tipe } = req.query;

    const where: Record<string, string> = {};
    if (tipe) where.tipe = tipe as string;

    const total = await prisma.document.count({ where });
    const proses = await prisma.document.count({ where: { ...where, status: 'proses' } });
    const selesai = await prisma.document.count({ where: { ...where, status: 'selesai' } });
    const error = await prisma.document.count({ where: { ...where, status: 'error' } });

    res.json({ total, proses, selesai, error });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});
// GET /api/documents/export - Ekspor data ke CSV
router.get('/export', async (req: Request, res: Response) => {
  try {
    const { tipe } = req.query;
    const where: Record<string, string> = {};
    if (tipe) where.tipe = tipe as string;

    const documents = await prisma.document.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const header = 'No,No Berkas,Judul,Lokasi,Tipe,Status,Klasifikasi,Keamanan,Petugas,Tanggal';
    const rows = documents.map((doc, i) =>
      `${i + 1},"${doc.noBerkas}","${doc.judul}","${doc.lokasi}","${doc.tipe}","${doc.status}","${doc.klasifikasi}","${doc.keamanan}","${doc.author.name}","${doc.createdAt.toISOString().split('T')[0]}"`
    );
    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="laporan_${tipe || 'semua'}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('\uFEFF' + csv); // BOM untuk Excel
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
  }
});

// DELETE /api/documents/:id - Hapus dokumen
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.document.delete({ where: { id } });
    res.status(200).json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Gagal menghapus dokumen' });
  }
});

export default router;

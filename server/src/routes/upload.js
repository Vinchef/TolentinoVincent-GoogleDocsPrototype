import express from 'express';
import multer from 'multer';
import path from 'path';
import mammoth from 'mammoth';
import prisma from '../prisma.js';

const router = express.Router();

// Multer memory storage configuration (Max 2MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.txt' || ext === '.md' || ext === '.docx') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload a .txt, .md, or .docx file.'));
    }
  },
});

// Helper function to format filename into clean document title
function formatTitle(filename) {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  return nameWithoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to convert plain text / markdown text to valid Tiptap JSON
function textToTiptapJson(text) {
  if (!text || typeof text !== 'string') {
    return JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    });
  }

  const lines = text.split(/\r?\n/);
  const contentNodes = [];
  let currentList = null;

  function flushList() {
    if (currentList) {
      contentNodes.push({
        type: currentList.type,
        content: currentList.items,
      });
      currentList = null;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      contentNodes.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: trimmed.slice(2).trim() }],
      });
    } else if (trimmed.startsWith('## ')) {
      flushList();
      contentNodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: trimmed.slice(3).trim() }],
      });
    } else if (trimmed.startsWith('### ')) {
      flushList();
      contentNodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: trimmed.slice(4).trim() }],
      });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.slice(2).trim();
      if (!currentList || currentList.type !== 'bulletList') {
        flushList();
        currentList = { type: 'bulletList', items: [] };
      }
      currentList.items.push({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: itemText }] }],
      });
    } else if (/^\d+\.\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s/, '').trim();
      if (!currentList || currentList.type !== 'orderedList') {
        flushList();
        currentList = { type: 'orderedList', items: [] };
      }
      currentList.items.push({
        type: 'listItem',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: itemText }] }],
      });
    } else {
      flushList();
      contentNodes.push({
        type: 'paragraph',
        content: [{ type: 'text', text: line }],
      });
    }
  }

  flushList();

  if (contentNodes.length === 0) {
    contentNodes.push({ type: 'paragraph' });
  }

  return JSON.stringify({
    type: 'doc',
    content: contentNodes,
  });
}

// POST /api/documents/import
router.post('/import', (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File is too large. Maximum size is 2 MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const ownerId = parseInt(req.body.ownerId, 10);
    if (isNaN(ownerId)) {
      return res.status(400).json({ error: 'Valid ownerId is required.' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!user) {
        return res.status(400).json({ error: 'Valid owner user not found.' });
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      let fileText = '';

      if (ext === '.docx') {
        const mammothResult = await mammoth.extractRawText({ buffer: req.file.buffer });
        fileText = mammothResult.value || '';
      } else {
        fileText = req.file.buffer.toString('utf-8');
      }

      const title = formatTitle(req.file.originalname) || 'Imported Document';
      const tiptapContent = textToTiptapJson(fileText);

      const document = await prisma.document.create({
        data: {
          title,
          content: tiptapContent,
          ownerId,
        },
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json(document);
    } catch (error) {
      console.error('Error importing file:', error);
      res.status(500).json({ error: 'Failed to import file' });
    }
  });
});

export default router;

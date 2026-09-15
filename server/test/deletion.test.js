import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

describe('Document Deletion API (Step 4)', () => {
  let owner;
  let nonOwner;
  let docToDelete;

  beforeAll(async () => {
    owner = await prisma.user.upsert({
      where: { email: 'delete_owner@example.com' },
      update: {},
      create: { name: 'Delete Owner', email: 'delete_owner@example.com' },
    });

    nonOwner = await prisma.user.upsert({
      where: { email: 'delete_nonowner@example.com' },
      update: {},
      create: { name: 'Delete NonOwner', email: 'delete_nonowner@example.com' },
    });

    docToDelete = await prisma.document.create({
      data: {
        title: 'Document To Delete',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        ownerId: owner.id,
      },
    });
  });

  it('DELETE /api/documents/:id - reject non-owner deletion attempt', async () => {
    const res = await request(app)
      .delete(`/api/documents/${docToDelete.id}?userId=${nonOwner.id}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only the document owner can delete this document.');
  });

  it('DELETE /api/documents/:id - owner can successfully delete document', async () => {
    const res = await request(app)
      .delete(`/api/documents/${docToDelete.id}?userId=${owner.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted successfully');
  });

  it('GET /api/documents/:id - deleted document returns 404', async () => {
    const res = await request(app)
      .get(`/api/documents/${docToDelete.id}?userId=${owner.id}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Document not found.');
  });
});

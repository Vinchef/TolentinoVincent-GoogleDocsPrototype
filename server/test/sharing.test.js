import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

describe('Document Sharing & Permissions API (Step 3)', () => {
  let ownerUser;
  let targetUser;
  let unauthorizedUser;
  let doc;

  beforeAll(async () => {
    ownerUser = await prisma.user.upsert({
      where: { email: 'owner_test@example.com' },
      update: {},
      create: { name: 'Owner User', email: 'owner_test@example.com' },
    });

    targetUser = await prisma.user.upsert({
      where: { email: 'target_test@example.com' },
      update: {},
      create: { name: 'Target User', email: 'target_test@example.com' },
    });

    unauthorizedUser = await prisma.user.upsert({
      where: { email: 'unauthorized_test@example.com' },
      update: {},
      create: { name: 'Unauthorized User', email: 'unauthorized_test@example.com' },
    });

    doc = await prisma.document.create({
      data: {
        title: 'Confidential Strategy',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        ownerId: ownerUser.id,
      },
    });
  });

  it('POST /api/documents/:id/share - owner can share document with target user', async () => {
    const res = await request(app)
      .post(`/api/documents/${doc.id}/share`)
      .send({
        userId: targetUser.id,
        ownerId: ownerUser.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toContain('Document shared with Target User');
  });

  it('GET /api/documents?userId=... - shared document appears in target user list', async () => {
    const res = await request(app).get(`/api/documents?userId=${targetUser.id}`);
    expect(res.status).toBe(200);
    expect(res.body.shared).toHaveLength(1);
    expect(res.body.shared[0].title).toBe('Confidential Strategy');
  });

  it('GET /api/documents/:id - shared user can access the document', async () => {
    const res = await request(app).get(`/api/documents/${doc.id}?userId=${targetUser.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Confidential Strategy');
    expect(res.body.isOwner).toBe(false);
  });

  it('POST /api/documents/:id/share - reject duplicate share attempt', async () => {
    const res = await request(app)
      .post(`/api/documents/${doc.id}/share`)
      .send({
        userId: targetUser.id,
        ownerId: ownerUser.id,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already shared');
  });

  it('POST /api/documents/:id/share - non-owner cannot share document', async () => {
    const res = await request(app)
      .post(`/api/documents/${doc.id}/share`)
      .send({
        userId: unauthorizedUser.id,
        ownerId: targetUser.id, // targetUser is not owner
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Only the document owner can share this document.');
  });

  it('GET /api/documents/:id - non-shared user is denied access', async () => {
    const res = await request(app).get(`/api/documents/${doc.id}?userId=${unauthorizedUser.id}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You do not have access to this document.');
  });
});

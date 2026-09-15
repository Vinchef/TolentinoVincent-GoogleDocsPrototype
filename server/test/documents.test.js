import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

describe('Document Creation, Editing, Renaming & Persistence API', () => {
  let vincent;
  let alex;
  let testDocId;

  beforeAll(async () => {
    // Clean and seed users
    await prisma.documentShare.deleteMany();
    await prisma.document.deleteMany();
    await prisma.user.deleteMany();

    vincent = await prisma.user.create({
      data: { name: 'Vincent', email: 'vincent@example.com' },
    });

    alex = await prisma.user.create({
      data: { name: 'Alex', email: 'alex@example.com' },
    });
  });

  it('GET /api/users should return seeded users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Vincent');
  });

  it('POST /api/documents should create a new document', async () => {
    const res = await request(app)
      .post('/api/documents')
      .send({
        title: 'Project Proposal',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        ownerId: vincent.id,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Project Proposal');
    expect(res.body.ownerId).toBe(vincent.id);
    testDocId = res.body.id;
  });

  it('GET /api/documents/:id should allow owner access', async () => {
    const res = await request(app).get(`/api/documents/${testDocId}?userId=${vincent.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Project Proposal');
    expect(res.body.isOwner).toBe(true);
  });

  it('GET /api/documents/:id should deny unauthorized user access', async () => {
    const res = await request(app).get(`/api/documents/${testDocId}?userId=${alex.id}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('You do not have access to this document.');
  });

  it('PUT /api/documents/:id should update document content', async () => {
    const updatedContent = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Formatted Rich Text' }] }],
    });

    const res = await request(app)
      .put(`/api/documents/${testDocId}`)
      .send({
        content: updatedContent,
        userId: vincent.id,
      });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe(updatedContent);
  });

  it('PATCH /api/documents/:id should rename document for owner', async () => {
    const res = await request(app)
      .patch(`/api/documents/${testDocId}`)
      .send({
        title: 'Renamed Project Proposal',
        userId: vincent.id,
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Renamed Project Proposal');
  });

  it('PATCH /api/documents/:id with empty title should return 400', async () => {
    const res = await request(app)
      .patch(`/api/documents/${testDocId}`)
      .send({
        title: '   ',
        userId: vincent.id,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Document title cannot be empty.');
  });
});

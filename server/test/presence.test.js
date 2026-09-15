import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

describe('Real-Time Presence API', () => {
  let user1;
  let user2;
  let doc;

  beforeAll(async () => {
    user1 = await prisma.user.upsert({
      where: { email: 'presence_u1@example.com' },
      update: {},
      create: { name: 'Presence User 1', email: 'presence_u1@example.com' },
    });

    user2 = await prisma.user.upsert({
      where: { email: 'presence_u2@example.com' },
      update: {},
      create: { name: 'Presence User 2', email: 'presence_u2@example.com' },
    });

    doc = await prisma.document.create({
      data: {
        title: 'Presence Test Document',
        content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
        ownerId: user1.id,
      },
    });
  });

  it('POST /api/documents/:id/presence - registers active user heartbeat', async () => {
    const res = await request(app)
      .post(`/api/documents/${doc.id}/presence`)
      .send({
        userId: user2.id,
        userName: user2.name,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/documents/:id/presence - returns active co-editor for user 1', async () => {
    const res = await request(app)
      .get(`/api/documents/${doc.id}/presence?userId=${user1.id}`);

    expect(res.status).toBe(200);
    expect(res.body.coEditors).toHaveLength(1);
    expect(res.body.coEditors[0].userName).toBe('Presence User 2');
  });
});

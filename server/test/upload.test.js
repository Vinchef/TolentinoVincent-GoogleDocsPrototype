import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

describe('File Upload / Document Import API (Step 2)', () => {
  let user;

  beforeAll(async () => {
    user = await prisma.user.upsert({
      where: { email: 'uploader@example.com' },
      update: {},
      create: { name: 'File Uploader', email: 'uploader@example.com' },
    });
  });

  it('POST /api/documents/import - successfully import a .txt file', async () => {
    const fileContent = 'Meeting Notes\nDiscuss project timeline and deliverables.';
    const res = await request(app)
      .post('/api/documents/import')
      .field('ownerId', user.id)
      .attach('file', Buffer.from(fileContent), 'meeting-notes.txt');

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Meeting Notes');
    expect(res.body.ownerId).toBe(user.id);
    expect(res.body.content).toContain('Discuss project timeline');
  });

  it('POST /api/documents/import - successfully import a .md file with markdown headings', async () => {
    const mdContent = '# Project Specification\n## Section 1\nOverview of the system architecture.';
    const res = await request(app)
      .post('/api/documents/import')
      .field('ownerId', user.id)
      .attach('file', Buffer.from(mdContent), 'project_specification.md');

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Project Specification');
    expect(res.body.content).toContain('heading');
  });

  it('POST /api/documents/import - reject unsupported file type (.pdf)', async () => {
    const res = await request(app)
      .post('/api/documents/import')
      .field('ownerId', user.id)
      .attach('file', Buffer.from('fake pdf data'), 'document.pdf');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Unsupported file type. Please upload a .txt or .md file.');
  });

  it('POST /api/documents/import - reject file exceeding 2 MB size limit', async () => {
    const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024, 'a');

    const res = await request(app)
      .post('/api/documents/import')
      .field('ownerId', user.id)
      .attach('file', largeBuffer, 'huge-file.txt');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('File is too large. Maximum size is 2 MB.');
  });
});

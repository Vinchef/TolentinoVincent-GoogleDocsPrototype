# DocuLite — Full-Stack Document Creation & Sharing Application

A lightweight, full-stack document creation, editing, file importing, and document sharing prototype built with React, Express, Prisma, and Tiptap.

## Features (Step 1 Completed)

- **Create New Documents**: Instantly spawn new documents with default title & content.
- **Rich Text Editing**: Formatting toolbar with Bold, Italic, Underline, H1 & H2 Headings, Bullet Lists, and Numbered Lists powered by Tiptap.
- **Rename Documents**: Click to inline edit document titles (owner-only).
- **Persistent Storage**: Save document content and metadata in local SQLite database via Prisma ORM.
- **Reopen & Switch**: Seamless user switching (mock authentication with Vincent and Alex) and persistent document loading.
- **Automated Testing**: Comprehensive integration API test suite with Vitest & Supertest.

## Tech Stack

### Frontend (`/client`)
- **React** + **Vite**
- **Tiptap** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`)
- Plain CSS

### Backend (`/server`)
- **Node.js** + **Express**
- **Prisma ORM** + **SQLite**
- **Multer** (for file uploads)

### Testing
- **Vitest** + **Supertest**

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd TolentinoVincent-GoogleDocsPrototype
```

### 2. Install & setup backend
```bash
cd server
npm install
npx prisma db push
node prisma/seed.js
npm run dev
```

### 3. Install & setup frontend
In a separate terminal window:
```bash
cd client
npm install
npm run dev
```

### 4. Open in Browser
Open `http://localhost:3000` to run the application.

---

## Running Automated Tests

To run the backend integration test suite:
```bash
cd server
npx vitest run
```
Hi
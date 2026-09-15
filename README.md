# DocuLite — Full-Stack Document Creation & Sharing Application

A lightweight, full-stack document creation, editing, file importing, and document sharing prototype built with React, Express, Prisma, and Tiptap.

## Completed Features

### 1. Document Creation & Rich Text Editing (Step 1)
- **Create New Documents**: Instantly spawn new documents with default title & content.
- **Rich Text Formatting**: Formatting toolbar supporting Bold, Italic, Underline, Headings (H1 & H2), Bullet Lists, and Numbered Lists powered by Tiptap.
- **Rename Documents**: Click to inline edit document titles (owner-only).
- **Persistent Storage**: Save document content and metadata in local SQLite database via Prisma ORM.
- **Reopen & Account Switch**: Seamless user switching (mock authentication with Vincent and Alex) and persistent document state loading.

### 2. File Upload / Document Import (Step 2)
- **Supported File Types**: `.txt` and `.md` files.
- **File Size Limit**: Maximum **2 MB** per uploaded file.
- **Automatic Conversion**: Converts text paragraphs and markdown headings (`#`, `##`) into editable Tiptap document structures.
- **Title Formatting**: Formats file names into clean document titles (e.g., `meeting-notes.txt` $\rightarrow$ `Meeting Notes`).
- **Validation**: Enforces strict MIME/extension and file size limits with user feedback in the UI.

> *Note: DOCX and PDF parsing are intentionally excluded in this version to maintain a clean, lightweight architecture.*

---

## Tech Stack

### Frontend (`/client`)
- **React** + **Vite**
- **Tiptap** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`)
- Plain CSS

### Backend (`/server`)
- **Node.js** + **Express**
- **Prisma ORM** + **SQLite**
- **Multer** (for multipart file uploads)

### Testing
- **Vitest** + **Supertest**

---

## Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Vinchef/TolentinoVincent-GoogleDocsPrototype.git
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

To run the backend integration test suite (covering documents API and file upload validation):
```bash
cd server
npx vitest run
```
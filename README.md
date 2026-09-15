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
- **Supported File Types**: `.txt`, `.md`, and `.docx` (Word Documents via `mammoth`).
- **File Size Limit**: Maximum **2 MB** per uploaded file.
- **Automatic Conversion**: Converts text paragraphs, markdown headings (`#`, `##`), and Word document text into editable Tiptap document structures.
- **Title Formatting**: Formats file names into clean document titles (e.g., `meeting-notes.docx` $\rightarrow$ `Meeting Notes`).
- **Validation**: Enforces strict MIME/extension and file size limits with user feedback in the UI.

### 3. Document Sharing & Access Control (Step 3)
- **Share Modal**: Document owners can share documents with other users (e.g., Vincent sharing with Alex) via a simple Share modal.
- **Sidebar Organization**: Clear visual separation between:
  - **MY DOCUMENTS**: Documents owned by the active user.
  - **SHARED WITH ME**: Documents shared with the active user, featuring an owner badge.
- **Role-Based Permissions**:
  - **Owner**: Full access to view, edit, save, rename, share, and delete.
  - **Shared User**: Allowed to view, edit, save, and remove from shared list. Cannot rename or re-share.
  - **Other Users**: Access strictly denied (`403 Forbidden`).

### 4. Data Persistence & Consistent Document Management (Step 4 & UI Polish)
- **Persistent Database**: All documents, formatted content, titles, and share records persist across browser refreshes and server restarts stored in local SQLite (`server/prisma/dev.db`).
- **Consistent Document Removal**:
  - **Owners**: Click `🗑 Delete` in header or sidebar to permanently delete owned documents.
  - **Shared Users**: Click `🗑 Remove` in header or sidebar to remove a document from their "SHARED WITH ME" list.
- **Smooth Refresh Loading**: Eliminates initial loading flash on refresh with a smooth loading state.
- **Clean Seeded Accounts**: Mock login screen strictly features seeded accounts (**Vincent** and **Alex**).

---

## Tech Stack

### Frontend (`/client`)
- **React** + **Vite**
- **Tiptap** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline`)
- Plain CSS

### Backend (`/server`)
- **Node.js** + **Express**
- **Prisma ORM** + **SQLite**
- **Multer** & **Mammoth** (for multipart file uploads & Word doc parsing)

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

To run the backend integration test suite (20 passed tests covering document CRUD, file upload validation, sharing permissions, and deletion):
```bash
cd server
npx vitest run
```
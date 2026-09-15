# DocuLite — 4-Hour Full-Stack Submission Plan

## 1. Goal

Build a small, polished full-stack document application that satisfies all required capabilities while staying realistic for approximately **4 hours of development with AI assistance**.

The application should prioritize:

1. Working core functionality
2. Simple architecture
3. Clear UX
4. Persistent data
5. A demonstrable sharing workflow
6. One meaningful automated test
7. Easy local setup and deployment

Do **not** attempt to build Google Docs or a production-grade collaboration platform.

---

# 2. Recommended Tech Stack

Use this exact stack unless a dependency causes a problem:

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Fast setup and familiar development model |
| Styling | Plain CSS | Avoid unnecessary setup and Tailwind configuration issues |
| Rich Text | Tiptap | Provides the editor functionality without building it manually |
| Backend | Node.js + Express | Lightweight REST API |
| ORM | Prisma | Simple database access and schema management |
| Database | SQLite | Persistent, local, zero external database setup |
| File Upload | Multer | Simple Express multipart upload handling |
| Testing | Vitest + Supertest | Fast and suitable for API integration testing |
| Deployment | Render | Simple deployment path for a small full-stack app |
| Version Control | GitHub | Repository and submission visibility |

## Architecture

```text
React + Vite
     |
     | REST API
     v
Express
     |
     v
Prisma
     |
     v
SQLite
```

Additional frontend/backend libraries:

```text
Tiptap   -> Rich text editor
Multer   -> .txt/.md file upload
CORS     -> Frontend/backend communication
Vitest   -> Test runner
Supertest -> API testing
```

---

# 3. Scope Decisions

These decisions are intentional.

## Build

- Create documents
- Rename documents
- Edit documents
- Save documents
- Reopen documents
- Rich text formatting
- File import
- Document sharing
- Owned/shared document distinction
- Persistent database storage
- Basic validation
- Basic error handling
- One meaningful automated test
- README documentation
- Deployment

## Do NOT build

- Real authentication
- Password registration
- Email verification
- Password reset
- Google OAuth
- Real-time collaboration
- WebSockets
- Comments
- Version history
- Document folders
- Search
- Notifications
- DOCX parsing
- PDF support
- Drag-and-drop organization
- Complex permission systems
- Admin dashboard
- Microservices
- Docker
- AWS/S3
- CI/CD pipeline

The assignment explicitly allows mocked or seeded users, so real authentication is unnecessary for this scope.

---

# 4. Product Concept

Use the working name:

# DocuLite

A lightweight document creation and sharing application.

The application has two seeded users:

```text
Vincent
vincent@example.com

Alex
alex@example.com
```

Users select which seeded account they want to use from a simple login screen.

This is intentionally mocked authentication.

README explanation:

> Authentication is intentionally mocked using seeded users because the assignment focuses on document creation, editing, persistence, file import, and sharing rather than production authentication.

---

# 5. Main User Experience

## Login

```text
+--------------------------------+
|           DocuLite             |
|                                |
|       Choose an account        |
|                                |
|       [ Login as Vincent ]     |
|                                |
|       [ Login as Alex ]        |
+--------------------------------+
```

Selecting a user stores the current user ID in localStorage.

No password is required.

---

# 6. Main Application Layout

Use a simple two-column layout.

```text
+---------------------------------------------------------------+
| DocuLite                                      Vincent          |
+----------------------+----------------------------------------+
|                      |                                        |
| MY DOCUMENTS         | Project Notes                          |
|                      |                                        |
| + New Document       | [B] [I] [U] [H1] [H2] [•] [1.]       |
|                      | -------------------------------------- |
| Project Notes        |                                        |
| Meeting Notes        | This is my document...                 |
|                      |                                        |
| SHARED WITH ME       |                                        |
|                      |                                        |
| Team Notes           |                                        |
|                      |                                        |
|                      | [Save]                         Saved ✓ |
+----------------------+----------------------------------------+
```

---

# 7. Database Design

Use Prisma with SQLite.

## User

```text
User
----
id
name
email
createdAt
```

## Document

```text
Document
--------
id
title
content
ownerId
createdAt
updatedAt
```

`content` should store Tiptap JSON as a string.

Example:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "Hello world"
        }
      ]
    }
  ]
}
```

This preserves document structure and formatting.

## DocumentShare

```text
DocumentShare
-------------
id
documentId
userId
createdAt
```

Relationships:

```text
User
 |
 +---- owns ----> Document
 |
 +---- shares --> DocumentShare

Document
 |
 +---- owner ---> User
 |
 +---- shares --> DocumentShare

DocumentShare
 |
 +---- document -> Document
 |
 +---- user -----> User
```

---

# 8. Prisma Schema

Create:

```text
server/prisma/schema.prisma
```

Use a schema equivalent to:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int             @id @default(autoincrement())
  name      String
  email     String          @unique
  documents Document[]
  shares    DocumentShare[]
  createdAt DateTime        @default(now())
}

model Document {
  id        Int             @id @default(autoincrement())
  title     String
  content   String
  ownerId   Int
  owner     User            @relation(fields: [ownerId], references: [id])
  shares    DocumentShare[]
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
}

model DocumentShare {
  id         Int      @id @default(autoincrement())
  documentId Int
  userId     Int
  createdAt  DateTime @default(now())

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([documentId, userId])
}
```

---

# 9. Project Structure

Use:

```text
doculite/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Toolbar.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── ShareModal.jsx
│   │   │   └── FileImport.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── routes/
│   │   │   ├── users.js
│   │   │   ├── documents.js
│   │   │   ├── sharing.js
│   │   │   └── upload.js
│   │   │
│   │   ├── prisma.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

Keep the structure simple.

Do not over-engineer it.

---

# 10. Required Frontend Dependencies

Inside `client` install:

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-underline
```

Tiptap extensions required:

- StarterKit
- Underline

StarterKit provides:

- paragraphs
- headings
- bold
- italic
- bullet lists
- ordered lists

Underline is added separately.

---

# 11. Required Backend Dependencies

Inside `server` install:

```bash
npm install express cors multer dotenv @prisma/client
npm install -D prisma vitest supertest
```

---

# 12. Environment Configuration

Create:

```text
server/.env
```

Use:

```env
DATABASE_URL="file:./dev.db"
PORT=5000
```

The frontend can use:

```env
VITE_API_URL=http://localhost:5000
```

if needed.

---

# 13. Required API

Keep the REST API small.

## Get users

```http
GET /api/users
```

Purpose:

Return seeded users for the mock login screen.

---

## Get documents for a user

```http
GET /api/documents?userId=1
```

Return:

```json
{
  "owned": [],
  "shared": []
}
```

Owned documents belong to the user.

Shared documents are documents where the user has a `DocumentShare` record.

---

## Create document

```http
POST /api/documents
```

Request:

```json
{
  "title": "Untitled Document",
  "content": "...",
  "ownerId": 1
}
```

---

## Get document

```http
GET /api/documents/:id?userId=1
```

The endpoint should allow access if:

```text
user is owner
OR
user has a DocumentShare record
```

Otherwise return:

```http
403 Forbidden
```

---

## Update document

```http
PUT /api/documents/:id
```

Request:

```json
{
  "title": "Project Notes",
  "content": "Tiptap JSON string",
  "userId": 1
}
```

Allow editing for:

```text
owner
OR
shared user
```

---

## Rename document

```http
PATCH /api/documents/:id
```

Request:

```json
{
  "title": "New Document Name",
  "userId": 1
}
```

Only the owner needs to be allowed to rename the document.

---

## Share document

```http
POST /api/documents/:id/share
```

Request:

```json
{
  "userId": 2,
  "ownerId": 1
}
```

Only the owner should be allowed to share a document.

Prevent duplicate shares.

---

## Import file

```http
POST /api/documents/import
```

Use multipart form data.

Fields:

```text
file
ownerId
```

Accept:

```text
.txt
.md
```

Maximum size:

```text
2 MB
```

The file becomes a new editable document.

---

# 14. Document Access Rules

Keep permissions simple.

## Owner

Can:

- open
- edit
- save
- rename
- share

## Shared user

Can:

- open
- edit
- save

Cannot:

- rename
- share

## Other users

Cannot access the document.

This is enough to demonstrate clear sharing logic.

---

# 15. Rich Text Editor

Use Tiptap.

Required toolbar:

```text
[B] [I] [U] [H1] [H2] [•] [1.]
```

Buttons:

```text
Bold
Italic
Underline
Heading 1
Heading 2
Bullet List
Ordered List
```

Do not implement:

- font family
- font color
- text alignment
- tables
- images
- links
- comments

Those are unnecessary for the assignment.

---

# 16. Saving

Use an explicit Save button.

Example:

```text
[ Save ]
```

After successful save:

```text
Saved ✓
```

While saving:

```text
Saving...
```

On failure:

```text
Unable to save document.
Please try again.
```

Do not implement autosave unless everything else is already complete.

---

# 17. New Document Flow

When the user clicks:

```text
+ New Document
```

Create:

```text
Untitled Document
```

with empty Tiptap content.

Immediately open it in the editor.

---

# 18. Rename Flow

Show the title above the editor.

Example:

```text
Project Notes                     [Rename]
```

Click Rename.

Use a simple input:

```text
[ Project Notes________________ ]

[ Save Name ]
```

Validate that the title is not empty.

---

# 19. File Import

Keep this feature intentionally simple.

UI:

```text
Import Document

Supported formats: .txt, .md
Maximum file size: 2 MB

[ Choose File ]
```

After upload:

```text
Importing...
```

Then:

```text
Imported successfully ✓
```

The server should:

1. Validate extension
2. Validate file size
3. Read text
4. Create a new Document
5. Use the filename as the initial title
6. Return the created document
7. Open it in the editor

Example:

```text
meeting-notes.txt
```

becomes:

```text
Meeting Notes
```

with the file contents inside the editor.

Do not implement DOCX.

---

# 20. Sharing UI

Add a Share button for owned documents:

```text
[ Share ]
```

Modal:

```text
Share "Project Notes"

Share with:

[ Alex ▼ ]

[ Share Document ]
```

After success:

```text
Document shared with Alex ✓
```

If already shared:

```text
This document is already shared with Alex.
```

---

# 21. Owned vs Shared Documents

Sidebar should clearly separate them.

```text
MY DOCUMENTS

Project Notes
Meeting Notes


SHARED WITH ME

Team Notes
Research Notes
```

This directly satisfies the requirement that owned and shared documents have a visible distinction.

---

# 22. Mock Login

Login screen:

```text
DocuLite

Choose an account

[ Vincent ]
[ Alex ]
```

When clicked:

```javascript
localStorage.setItem("userId", user.id);
```

Then redirect/show the main application.

Provide:

```text
Switch User
```

somewhere in the header so the reviewer can quickly demonstrate sharing.

---

# 23. Error Handling

Implement only useful validation.

## Empty title

```text
Document title cannot be empty.
```

## Unsupported file

```text
Unsupported file type. Please upload a .txt or .md file.
```

## File too large

```text
File is too large. Maximum size is 2 MB.
```

## Missing document

```text
Document not found.
```

## Unauthorized access

```text
You do not have access to this document.
```

## Save failure

```text
Unable to save document. Please try again.
```

Do not create a complex error handling framework.

---

# 24. Automated Test

Write at least one meaningful integration test.

Best choice:

## Shared User Can Access Shared Document

Test flow:

```text
1. Create/find Vincent
2. Create a document owned by Vincent
3. Share it with Alex
4. Request Alex's documents
5. Verify the document appears in Alex's shared documents
6. Optionally request the document itself as Alex
7. Verify access succeeds
```

This test demonstrates the core sharing behavior.

Example test description:

```text
should allow a shared user to access a document
```

This is better than testing whether a button renders.

---

# 25. Suggested Test Cases

If there is extra time, add:

```text
1. Owner can create a document
2. Shared user can access a shared document
3. Non-shared user cannot access a document
4. Unsupported file type is rejected
5. Duplicate share is rejected
```

But the first sharing test is the priority.

---

# 26. Four-Hour Development Schedule

## 00:00–00:30 — Setup

### Goal

Get the application running.

Tasks:

- Create GitHub repository
- Create Vite React app
- Create Express server
- Install dependencies
- Create Prisma schema
- Configure SQLite
- Run Prisma migration
- Seed users
- Verify frontend and backend start

Do not style yet.

Checkpoint:

```text
Frontend loads.
Backend responds.
Database exists.
Users exist.
```

---

# 27. 00:30–01:15 — Backend

Implement:

```text
GET /api/users
GET /api/documents
POST /api/documents
GET /api/documents/:id
PUT /api/documents/:id
PATCH /api/documents/:id
POST /api/documents/:id/share
POST /api/documents/import
```

Checkpoint:

You should be able to create and retrieve a document using the API.

Do not spend time making the backend architecture perfect.

---

# 28. 01:15–02:15 — Frontend

Build:

```text
Login
Sidebar
Document list
New Document
Editor
Save
Rename
```

Integrate Tiptap.

Required editor functions:

```text
Bold
Italic
Underline
Heading
Bullet list
Ordered list
```

Checkpoint:

You should be able to:

```text
Login
↓
Create document
↓
Type formatted content
↓
Save
↓
Refresh
↓
Open document
```

---

# 29. 02:15–02:45 — Sharing

Build:

```text
Share button
Share modal
User selector
Shared document list
Switch user
```

Test manually:

```text
Vincent
↓
Create Project Notes
↓
Share with Alex
↓
Switch to Alex
↓
Shared With Me
↓
Open Project Notes
```

This should be one of the main demo flows.

---

# 30. 02:45–03:10 — File Import

Implement:

```text
.txt
.md
```

only.

Test:

```text
Choose file
↓
Upload
↓
Document created
↓
Document opens
↓
Edit
↓
Save
```

---

# 31. 03:10–03:30 — Polish

Add:

- Loading states
- Save status
- Error messages
- Disabled buttons while saving
- Empty document state
- Clean spacing
- Responsive layout
- Basic hover states

Avoid spending 20 minutes choosing perfect colors.

Functionality matters more.

---

# 32. 03:30–03:45 — Test

Write the sharing integration test.

Run:

```bash
npm test
```

Make sure it passes.

If you have time, add one upload validation test.

---

# 33. 03:45–04:00 — README + Deployment

Finish README.

Confirm:

```text
npm install
npm run dev
```

works.

Commit code.

Push to GitHub.

Deploy.

Test the deployed application from a fresh browser session.

---

# 34. Deployment Strategy

Use Render for the deployed version.

The final reviewer should receive:

```text
Live Application:
<deployment URL>

GitHub Repository:
<repository URL>
```

If deploying the frontend and backend separately becomes difficult under the time limit, simplify the deployment architecture rather than spending excessive time troubleshooting.

The important thing is that reviewers can access a working deployment.

---

# 35. README Content

The final README should contain:

```text
# DocuLite

A lightweight full-stack document creation, editing, importing, and sharing application.

## Features

- Create documents
- Rename documents
- Rich text editing
- Persistent document storage
- TXT/MD file import
- Document sharing
- Owned/shared document separation
- Mock user accounts
- Basic validation
- Automated integration test

## Tech Stack

Frontend:
- React
- Vite
- Tiptap
- CSS

Backend:
- Node.js
- Express
- Prisma
- SQLite
- Multer

Testing:
- Vitest
- Supertest

## Architecture

React/Vite
    |
    | REST API
    v
Express
    |
    v
Prisma
    |
    v
SQLite

## Supported File Types

Currently supported:

- .txt
- .md

Maximum upload size:

2 MB

DOCX and PDF files are intentionally not supported in this version to keep the implementation focused on the core product requirements.

## Mock Users

Vincent
vincent@example.com

Alex
alex@example.com

Authentication is intentionally mocked using seeded users.

## Local Setup

### 1. Clone repository

git clone <repository-url>

### 2. Install frontend

cd client
npm install

### 3. Install backend

cd ../server
npm install

### 4. Configure environment

Create server/.env:

DATABASE_URL="file:./dev.db"
PORT=5000

### 5. Initialize database

npx prisma migrate dev
npx prisma db seed

### 6. Start backend

npm run dev

### 7. Start frontend

cd ../client
npm run dev

## Testing

Run the automated test suite:

npm test

The primary integration test verifies that a document owner can share a document with another user and that the shared user can access it.

## Architecture Decisions

The application intentionally uses a lightweight architecture suitable for the assignment.

SQLite was selected instead of an external database because it provides persistent relational storage without additional infrastructure.

Tiptap was selected instead of implementing a rich text editor manually because it provides reliable document structure and formatting support while keeping the implementation small.

Authentication is mocked using seeded users because production authentication is outside the scope of the exercise.

File import is limited to TXT and Markdown files to avoid introducing unnecessary document parsing complexity.

Real-time collaboration, version history, comments, and advanced permissions are intentionally out of scope.

## Tradeoffs

The application prioritizes:

1. Core functionality
2. Data persistence
3. Clear sharing behavior
4. Maintainable code
5. Simple deployment

It intentionally does not attempt to provide enterprise-level collaboration or authentication.

## Future Improvements

If this were developed further:

- Real authentication
- Role-based permissions
- Real-time collaboration
- Document version history
- DOCX/PDF import
- Comments
- Search
- Folder organization
- Cloud file storage
- Automated deployment pipeline
```

---

# 36. Definition of Done

Before submission, verify every item.

## Document Creation

- [ ] User can create a document
- [ ] New document appears in sidebar
- [ ] User can open it
- [ ] User can edit it

## Rename

- [ ] User can rename a document
- [ ] New name persists after refresh

## Rich Text

- [ ] Bold works
- [ ] Italic works
- [ ] Underline works
- [ ] Heading works
- [ ] Bullet list works
- [ ] Numbered list works
- [ ] Formatting survives save/reopen

## File Upload

- [ ] .txt upload works
- [ ] .md upload works
- [ ] Imported content becomes editable
- [ ] Unsupported files are rejected
- [ ] File size is limited

## Sharing

- [ ] Owner is visible
- [ ] Owner can share
- [ ] Shared user appears in shared list
- [ ] Shared user can open the document
- [ ] Non-shared user cannot access it
- [ ] Owned/shared sections are visibly different

## Persistence

- [ ] Refresh does not delete documents
- [ ] Content persists
- [ ] Formatting persists
- [ ] Sharing persists

## Engineering Quality

- [ ] README exists
- [ ] Setup instructions work
- [ ] Deployment works
- [ ] Validation exists
- [ ] Error handling exists
- [ ] At least one automated test passes

---

# 37. Manual Demo Script

Use this exact flow during review.

## Step 1 — Login

Login as:

```text
Vincent
```

Show the dashboard.

---

## Step 2 — Create

Click:

```text
+ New Document
```

Name it:

```text
Project Proposal
```

Enter:

```text
Project Proposal

This document demonstrates the DocuLite editor.

Objectives:
- Create a simple document
- Edit formatted content
- Share the document
```

Use:

- Heading
- Bold
- Bullet list

Click Save.

---

## Step 3 — Persistence

Refresh the browser.

Open:

```text
Project Proposal
```

Show that:

- document still exists
- formatting still exists
- content still exists

This demonstrates persistence.

---

## Step 4 — Rename

Rename:

```text
Project Proposal
```

to:

```text
Team Project Proposal
```

Save.

---

## Step 5 — Import

Import:

```text
sample-notes.txt
```

Show that it becomes a new editable document.

---

## Step 6 — Share

Switch back to:

```text
Team Project Proposal
```

Click:

```text
Share
```

Select:

```text
Alex
```

Share.

---

## Step 7 — Switch User

Switch from Vincent to:

```text
Alex
```

Show:

```text
SHARED WITH ME

Team Project Proposal
```

Open it.

Edit something.

Save.

This demonstrates shared access.

---

## Step 8 — Automated Test

Show the test result:

```text
PASS
```

Explain:

> The integration test verifies the document sharing workflow, including granting access to another user and allowing that shared user to retrieve the document.

---

# 38. How to Use AI During Development

AI should be used to accelerate implementation, not to expand the scope.

Give AI small tasks.

Good prompts:

```text
Create the Prisma schema for User, Document, and DocumentShare using SQLite.
```

```text
Create an Express route for creating and retrieving documents using Prisma.
```

```text
Create a React Tiptap editor with bold, italic, underline, headings, bullet lists, and ordered lists.
```

```text
Add a share modal that lets the document owner select another seeded user.
```

```text
Write a Supertest integration test that verifies a shared user can access a document.
```

Avoid asking AI:

```text
Build a complete Google Docs clone.
```

That will create unnecessary complexity.

---

# 39. AI Coding Rule

When AI generates code:

1. Ask it to modify only the relevant files.
2. Run the application immediately.
3. Fix errors before moving to the next feature.
4. Do not accept large architectural changes late in the project.
5. Keep dependencies minimal.
6. Do not add a library unless it clearly saves time.

The biggest risk in a four-hour project is not lack of code.

It is **scope creep**.

---

# 40. Priority Order If Time Runs Out

If you have less time than expected, follow this priority order.

## Must Have

1. Document creation
2. Editing
3. Saving
4. Persistence
5. Sharing
6. Owned/shared distinction

## High Priority

7. Rich text formatting
8. File import
9. Validation
10. Automated test

## Lower Priority

11. Visual polish
12. Advanced error messages
13. Additional tests

If you reach 3 hours and something is broken, **stop adding features and make the existing features reliable.**

---

# 41. Final Target

The final product should be small but complete.

The reviewer should be able to understand the application within 30 seconds:

```text
Login
  ↓
Documents
  ↓
Rich text editor
  ↓
Save
  ↓
Import
  ↓
Share
  ↓
Other user accesses shared document
```

The strongest implementation is not the one with the most features.

It is the one where every required feature works reliably and the engineering decisions are easy to explain.

---

# 42. Final Architecture Statement

Use this in the architecture section of the submission:

> DocuLite uses a lightweight React/Vite frontend connected to an Express REST API. Prisma provides the data-access layer for a SQLite database containing users, documents, and document-sharing relationships. Tiptap handles structured rich-text editing, while Multer handles limited TXT and Markdown imports. Authentication is intentionally mocked through seeded users to keep the implementation focused on the required document workflow. The architecture prioritizes simplicity, persistence, testability, and reliable demonstration of the core requirements within the available development time.

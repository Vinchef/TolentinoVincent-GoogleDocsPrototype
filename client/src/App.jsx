import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import DocumentHeader from './components/DocumentHeader';
import Editor from './components/Editor';
import ShareModal from './components/ShareModal';

export default function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [ownedDocs, setOwnedDocs] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [coEditors, setCoEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch seeded users on mount
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        const savedUserId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
        if (savedUserId) {
          const user = data.find((u) => u.id === parseInt(savedUserId, 10));
          if (user) setCurrentUser(user);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        setError('Failed to connect to backend server');
        setLoading(false);
      });
  }, []);

  // Fetch documents for active user
  const fetchDocuments = useCallback(async (userId) => {
    setDocsLoading(true);
    try {
      const res = await fetch(`/api/documents?userId=${userId}`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setOwnedDocs(data.owned || []);
      setSharedDocs(data.shared || []);
      return data;
    } catch (err) {
      console.error(err);
      setError('Could not load documents');
      return { owned: [], shared: [] };
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDocuments(currentUser.id);
    }
  }, [currentUser, fetchDocuments]);

  // Real-time collaboration presence heartbeat & polling
  useEffect(() => {
    if (!activeDoc || !currentUser) {
      setCoEditors([]);
      return;
    }

    const sendPresence = async () => {
      try {
        await fetch(`/api/documents/${activeDoc.id}/presence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userName: currentUser.name,
          }),
        });

        const res = await fetch(`/api/documents/${activeDoc.id}/presence?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setCoEditors(data.coEditors || []);
        }
      } catch (err) {
        console.error('Presence poll error:', err);
      }
    };

    sendPresence();
    const interval = setInterval(sendPresence, 2000);
    return () => clearInterval(interval);
  }, [activeDoc?.id, currentUser?.id, currentUser?.name]);

  const handleSelectUser = (user) => {
    setCurrentUser(user);
    sessionStorage.setItem('userId', user.id);
    localStorage.setItem('userId', user.id);
    setActiveDoc(null);
    setEditorContent('');
  };

  const handleSwitchUser = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    setActiveDoc(null);
  };

  const handleSelectDoc = async (docId, userIdOverride) => {
    const userId = userIdOverride || currentUser?.id;
    if (!userId) return;

    try {
      const res = await fetch(`/api/documents/${docId}?userId=${userId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to open document');
      }
      const doc = await res.json();
      setActiveDoc(doc);
      setEditorContent(doc.content);
      setSaveStatus('idle');
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleCreateDoc = async () => {
    if (!currentUser) return;

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Document',
          content: JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] }),
          ownerId: currentUser.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to create document');
      const newDoc = await res.json();
      await fetchDocuments(currentUser.id);
      setActiveDoc(newDoc);
      setEditorContent(newDoc.content);
      setSaveStatus('idle');
    } catch (err) {
      console.error(err);
      setError('Could not create document');
    }
  };

  const handleSaveDoc = async () => {
    if (!activeDoc || !currentUser) return;

    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/documents/${activeDoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeDoc.title,
          content: editorContent,
          userId: currentUser.id,
        }),
      });

      if (!res.ok) throw new Error('Unable to save document.');
      const updatedDoc = await res.json();
      setActiveDoc((prev) => ({ ...prev, content: updatedDoc.content }));
      setSaveStatus('saved');
      await fetchDocuments(currentUser.id);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  const handleRenameDoc = async (newTitle) => {
    if (!activeDoc || !currentUser) return;

    try {
      const res = await fetch(`/api/documents/${activeDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          userId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to rename document');
      }

      const updatedDoc = await res.json();
      setActiveDoc((prev) => ({ ...prev, title: updatedDoc.title }));
      await fetchDocuments(currentUser.id);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleImportDocSuccess = async (newDoc) => {
    if (!currentUser) return;
    await fetchDocuments(currentUser.id);
    setActiveDoc(newDoc);
    setEditorContent(newDoc.content);
    setSaveStatus('idle');
  };

  const handleDeleteDoc = async (docToDelete) => {
    if (!docToDelete || !currentUser) return;

    const confirmed = window.confirm(`Are you sure you want to delete "${docToDelete.title}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/documents/${docToDelete.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete document');
      }

      if (activeDoc?.id === docToDelete.id) {
        setActiveDoc(null);
        setEditorContent('');
      }

      await fetchDocuments(currentUser.id);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Login Screen view
  if (!currentUser) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <h1 className="login-logo">DocuLite</h1>
          <p className="login-subtitle">Choose an account to continue</p>

          {loading ? (
            <p>Loading accounts...</p>
          ) : error ? (
            <div className="error-box">{error}</div>
          ) : (
            <div className="user-buttons">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="btn-login"
                >
                  Login as {user.name} ({user.email})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        ownedDocs={ownedDocs}
        sharedDocs={sharedDocs}
        activeDocId={activeDoc?.id}
        onSelectDoc={(docId) => handleSelectDoc(docId)}
        onCreateDoc={handleCreateDoc}
        onImportDocSuccess={handleImportDocSuccess}
        onDeleteDoc={handleDeleteDoc}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
      />

      <main className="main-content">
        {error && (
          <div className="banner-error">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {docsLoading && !activeDoc ? (
          <div className="empty-workspace">
            <p>Loading documents...</p>
          </div>
        ) : activeDoc ? (
          <div className="document-view">
            <DocumentHeader
              document={activeDoc}
              onSave={handleSaveDoc}
              onRename={handleRenameDoc}
              onOpenShare={() => setIsShareModalOpen(true)}
              onDelete={() => handleDeleteDoc(activeDoc)}
              saveStatus={saveStatus}
              isOwner={activeDoc.ownerId === currentUser.id}
              coEditors={coEditors}
            />
            <Editor
              content={editorContent}
              onChange={(newContent) => {
                setEditorContent(newContent);
                if (saveStatus === 'saved') setSaveStatus('idle');
              }}
              readOnly={false}
              coEditors={coEditors}
            />
          </div>
        ) : (
          <div className="empty-workspace">
            <h2>Select or create a document to get started</h2>
            <button onClick={handleCreateDoc} className="btn-primary">
              + New Document
            </button>
          </div>
        )}

        {isShareModalOpen && activeDoc && (
          <ShareModal
            document={activeDoc}
            users={users}
            currentUser={currentUser}
            onClose={() => setIsShareModalOpen(false)}
            onShareSuccess={() => {
              fetchDocuments(currentUser.id);
            }}
          />
        )}
      </main>
    </div>
  );
}

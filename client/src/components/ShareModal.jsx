import React, { useState } from 'react';

export default function ShareModal({ document, users = [], currentUser, onClose, onShareSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [sharing, setSharing] = useState(false);

  // Filter out the current user (owner) from target share list
  const availableUsers = users.filter((u) => u.id !== currentUser?.id);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg('Please select a user to share with.');
      return;
    }

    setSharing(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(selectedUserId, 10),
          ownerId: currentUser.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to share document.');
      }

      setStatusMsg(data.message || 'Document shared successfully ✓');
      setSelectedUserId('');
      if (onShareSuccess) {
        onShareSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Share "{document?.title}"</h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleShare} className="modal-body">
          <label htmlFor="user-select" className="modal-label">
            Select user to share with:
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="modal-select"
            disabled={sharing}
          >
            <option value="">-- Choose Account --</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          {document?.shares && document.shares.length > 0 && (
            <div className="modal-shares-list" style={{ marginBottom: '1rem' }}>
              <label className="modal-label">Currently shared with:</label>
              <ul style={{ margin: '0.25rem 0 0 1.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
                {document.shares.map((s) => (
                  <li key={s.id || s.userId}>
                    <strong>{s.user?.name || 'User'}</strong> ({s.user?.email || 'No email'})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {statusMsg && <div className="modal-status success">{statusMsg}</div>}
          {errorMsg && <div className="modal-status error">{errorMsg}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={sharing || !selectedUserId}
            >
              {sharing ? 'Sharing...' : 'Share Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

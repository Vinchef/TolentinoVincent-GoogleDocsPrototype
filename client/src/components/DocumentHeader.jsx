import React, { useState, useEffect } from 'react';

export default function DocumentHeader({
  document,
  onSave,
  onRename,
  saveStatus,
  isOwner,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(document?.title || '');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (document) {
      setTitleInput(document.title);
    }
  }, [document]);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (!titleInput || titleInput.trim() === '') {
      setErrorMsg('Document title cannot be empty.');
      return;
    }
    setErrorMsg('');
    setIsEditingTitle(false);
    if (titleInput !== document.title) {
      onRename(titleInput.trim());
    }
  };

  return (
    <div className="doc-header">
      <div className="doc-title-container">
        {isEditingTitle && isOwner ? (
          <form onSubmit={handleTitleSubmit} className="title-edit-form">
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="title-input"
              autoFocus
              onBlur={handleTitleSubmit}
            />
            <button type="submit" className="btn-small btn-primary">Save Title</button>
          </form>
        ) : (
          <div className="title-display">
            <h1 className="doc-title" onClick={() => isOwner && setIsEditingTitle(true)}>
              {document?.title || 'Untitled Document'}
            </h1>
            {isOwner && (
              <button
                type="button"
                className="btn-link"
                onClick={() => setIsEditingTitle(true)}
              >
                Rename
              </button>
            )}
          </div>
        )}
        {errorMsg && <div className="header-error">{errorMsg}</div>}
      </div>

      <div className="doc-header-actions">
        <div className="save-status">
          {saveStatus === 'saving' && <span className="status-saving">Saving...</span>}
          {saveStatus === 'saved' && <span className="status-saved">Saved ✓</span>}
          {saveStatus === 'error' && <span className="status-error">Save failed</span>}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="btn-primary"
        >
          Save
        </button>
      </div>
    </div>
  );
}

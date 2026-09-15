import React from 'react';
import FileImport from './FileImport';

export default function Sidebar({
  ownedDocs = [],
  sharedDocs = [],
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onImportDocSuccess,
  onDeleteDoc,
  currentUser,
  onSwitchUser,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="app-logo">DocuLite</h2>
        <div className="user-profile">
          <span className="user-name">👤 {currentUser?.name}</span>
          <button type="button" onClick={onSwitchUser} className="btn-link btn-switch-user">
            Switch User
          </button>
        </div>
      </div>

      <div className="sidebar-actions">
        <button
          type="button"
          onClick={onCreateDoc}
          className="btn-new-doc"
        >
          + New Document
        </button>
        <FileImport
          ownerId={currentUser?.id}
          onImportSuccess={onImportDocSuccess}
        />
      </div>

      <div className="sidebar-sections">
        <section className="doc-section">
          <h3 className="section-title">MY DOCUMENTS</h3>
          {ownedDocs.length === 0 ? (
            <div className="empty-section">No documents created yet</div>
          ) : (
            <ul className="doc-list">
              {ownedDocs.map((doc) => (
                <li
                  key={doc.id}
                  className={`doc-item ${doc.id === activeDocId ? 'active' : ''}`}
                  onClick={() => onSelectDoc(doc.id)}
                >
                  <span className="doc-item-title">{doc.title}</span>
                  {onDeleteDoc && (
                    <button
                      type="button"
                      className="btn-icon-delete"
                      title="Delete Document"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc);
                      }}
                    >
                      🗑
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {sharedDocs.length > 0 && (
          <section className="doc-section">
            <h3 className="section-title">SHARED WITH ME</h3>
            <ul className="doc-list">
              {sharedDocs.map((doc) => (
                <li
                  key={doc.id}
                  className={`doc-item ${doc.id === activeDocId ? 'active' : ''}`}
                  onClick={() => onSelectDoc(doc.id)}
                >
                  <span className="doc-item-title">{doc.title}</span>
                  <span className="doc-owner-badge">{doc.owner?.name}</span>
                  {onDeleteDoc && (
                    <button
                      type="button"
                      className="btn-icon-delete"
                      title="Remove from your Shared list"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc);
                      }}
                    >
                      🗑
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}

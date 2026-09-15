import React, { useState, useRef } from 'react';

export default function FileImport({ onImportSuccess, ownerId }) {
  const [importing, setImporting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side quick check
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.txt' && ext !== '.md') {
      setErrorMsg('Unsupported file type. Please upload a .txt or .md file.');
      setStatusMsg(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File is too large. Maximum size is 2 MB.');
      setStatusMsg(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('ownerId', ownerId);

    setImporting(true);
    setStatusMsg('Importing...');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/documents/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import document.');
      }

      setStatusMsg('Imported successfully ✓');
      setTimeout(() => setStatusMsg(null), 3000);

      if (onImportSuccess) {
        onImportSuccess(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setStatusMsg(null);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-import-container">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md"
        style={{ display: 'none' }}
      />
      <button
        type="button"
        className="btn-import-doc"
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
      >
        {importing ? 'Importing...' : '📁 Import (.txt, .md)'}
      </button>

      {statusMsg && <div className="import-status success">{statusMsg}</div>}
      {errorMsg && <div className="import-status error">{errorMsg}</div>}
    </div>
  );
}

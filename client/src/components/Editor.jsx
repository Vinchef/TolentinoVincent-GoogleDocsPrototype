import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Toolbar from './Toolbar';

export default function Editor({ content, onChange, readOnly = false, coEditors = [] }) {
  const parseContent = (rawContent) => {
    if (!rawContent) return '';
    if (typeof rawContent === 'object') return rawContent;
    try {
      return JSON.parse(rawContent);
    } catch (e) {
      return rawContent;
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: parseContent(content),
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const jsonContent = JSON.stringify(editor.getJSON());
      if (onChange) {
        onChange(jsonContent);
      }
    },
  });

  // Keep content updated when active document changes externally
  useEffect(() => {
    if (editor && content !== undefined) {
      const parsed = parseContent(content);
      const currentJson = JSON.stringify(editor.getJSON());
      const newJson = typeof parsed === 'string' ? parsed : JSON.stringify(parsed);

      if (currentJson !== newJson) {
        editor.commands.setContent(parsed, false);
      }
    }
  }, [content, editor]);

  // Handle readOnly toggles
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  return (
    <div className="editor-container">
      {!readOnly && <Toolbar editor={editor} />}
      <div className="editor-body">
        {coEditors.length > 0 && (
          <div className="coeditor-cursor-bar">
            {coEditors.map((u) => (
              <span key={u.userId} className="coeditor-cursor-pill">
                <span className="blinking-cursor">|</span> {u.userName}
              </span>
            ))}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

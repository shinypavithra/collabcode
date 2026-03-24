import React, { useRef, useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";

// Defined outside component — not re-created on every render
const MONACO_THEME = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "comment", foreground: "546E7A", fontStyle: "italic" },
    { token: "keyword", foreground: "C792EA", fontStyle: "bold" },
    { token: "string", foreground: "C3E88D" },
    { token: "number", foreground: "F78C6C" },
    { token: "type", foreground: "FFCB6B" },
  ],
  colors: {
    "editor.background": "#0D1117",
    "editor.foreground": "#EEFFFF",
    "editor.lineHighlightBackground": "#111823",
    "editorLineNumber.foreground": "#3D4A5C",
    "editorLineNumber.activeForeground": "#4ECDC4",
    "editor.selectionBackground": "#1E3A5F",
    "editorCursor.foreground": "#80CBC4",
    "editorGutter.background": "#0D1117",
    "scrollbarSlider.background": "#1E2D3D80",
  },
};

const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace",
  fontLigatures: true,
  lineHeight: 22,
  minimap: { enabled: true },
  scrollBeyondLastLine: false,
  renderLineHighlight: "line",
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  tabSize: 2,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  bracketPairColorization: { enabled: true },
};

const CodeEditor = ({ code, language, onChange, onCursorMove, remoteCursors }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      monaco.editor.defineTheme("cc-dark", MONACO_THEME);
      monaco.editor.setTheme("cc-dark");
      editor.onDidChangeCursorPosition((e) => {
        onCursorMove(e.position.lineNumber - 1, e.position.column - 1);
      });
    },
    [onCursorMove]
  );

  // Render remote cursors as decorations
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecs = Object.entries(remoteCursors).map(([sid, c]) => {
      const styleId = "rc-" + sid.replace(/[^a-z0-9]/gi, "");
      if (!document.getElementById(styleId)) {
        const el = document.createElement("style");
        el.id = styleId;
        el.textContent = `.${styleId} { border-left: 2px solid ${c.color} !important; margin-left: -1px; }`;
        document.head.appendChild(el);
      }
      return {
        range: new monaco.Range(
          (c.line || 0) + 1,
          (c.col || 0) + 1,
          (c.line || 0) + 1,
          (c.col || 0) + 1
        ),
        options: { className: styleId, stickiness: 1 },
      };
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecs
    );
  }, [remoteCursors]);

  return (
    <Editor
      value={code}
      language={language}
      onChange={(val) => onChange(val || "")}
      onMount={handleMount}
      height="100%"
      theme="cc-dark"
      options={EDITOR_OPTIONS}
    />
  );
};

export default CodeEditor;

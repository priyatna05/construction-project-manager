import { useComputedColorScheme } from '@mantine/core';
import { RichTextEditor as Editor, Link } from '@mantine/tiptap';
import Highlight from '@tiptap/extension-highlight';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { forwardRef, useImperativeHandle } from 'react';
import suggestion from './RichTextEditor/Mention/suggestion.js';
import classes from './css/RichTextEditor.module.css';

const RichTextEditor = forwardRef(function RichTextEditor(
  { onChange, placeholder, content, height = 200, readOnly = false, ...props },
  ref
) {
  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Highlight,
      Placeholder.configure({ placeholder }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // ====================================================================
  // ===== BLOK KODE PERBAIKAN ADA DI SINI ==============================
  // ====================================================================
  useImperativeHandle(
    ref,
    () => ({
      /**
       * Mengatur konten editor secara programatik dari luar.
       * @param {string} newContent Konten HTML baru.
       */
      setContent(newContent) {
        if (editor && editor.getHTML() !== newContent) {
          // Parameter kedua 'false' mencegah trigger event 'onUpdate'
          // untuk menghindari infinite loop.
          editor.commands.setContent(newContent, false);
        }
      },
      /**
       * Mendapatkan konten HTML editor saat ini.
       * @returns {string} Konten HTML.
       */
      getContent() {
        // Mengembalikan konten jika editor sudah siap, jika tidak, string kosong.
        return editor ? editor.getHTML() : '';
      },
    }),
    [editor]
  ); // <-- Tambahkan `editor` sebagai dependensi.

  const computedColorScheme = useComputedColorScheme();

  return (
    <Editor
      editor={editor}
      {...props}
    >
      <Editor.Toolbar
        sticky
        stickyOffset={60}
      >
        <Editor.ControlsGroup>
          <Editor.Bold />
          <Editor.Italic />
          <Editor.Underline />
          <Editor.Strikethrough />
          <Editor.Highlight />
        </Editor.ControlsGroup>

        <Editor.ControlsGroup>
          <Editor.BulletList />
          <Editor.OrderedList />
        </Editor.ControlsGroup>

        <Editor.ControlsGroup>
          <Editor.Link />
          <Editor.Unlink />
        </Editor.ControlsGroup>

        <Editor.ControlsGroup>
          <Editor.Code />
          <Editor.Blockquote />
        </Editor.ControlsGroup>
      </Editor.Toolbar>

      <Editor.Content
        bg={computedColorScheme === 'dark' ? 'dark.6' : 'white'}
        className={classes.content}
        style={{ '--rich-text-editor-height': `${height}px` }}
      />
    </Editor>
  );
});

export default RichTextEditor;

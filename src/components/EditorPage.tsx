import React, { useRef, useState, useEffect } from 'react';
import { Box, Grid, Paper, InputBase, useTheme } from '@mui/material';
import { EditorToolbar } from './EditorToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import type { User } from 'firebase/auth';

interface EditorPageProps {
  fileName: string;
  fileContent: string;
  fileType: 'txt' | 'md';
  onContentChange: (content: string) => void;
  onSave: () => void;
  onBack: () => void;
  onImport: (name: string, content: string) => void;
  
  // Cloud & Sharing props
  user: User | null;
  cloudNoteId: string | null;
  isPublic: boolean;
  readOnly: boolean;
  isCloudSaving: boolean;
  onSaveToCloud: () => Promise<void>;
  onTogglePublic: (newVal: boolean) => Promise<void>;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  fileName,
  fileContent,
  fileType,
  onContentChange,
  onSave,
  onBack,
  onImport,
  user,
  cloudNoteId,
  isPublic,
  readOnly,
  isCloudSaving,
  onSaveToCloud,
  onTogglePublic,
}) => {
  const theme = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);

  const handleSelect = (e: React.SyntheticEvent<any>) => {
    const target = e.target as HTMLTextAreaElement | HTMLInputElement;
    if (target) {
      setSelectionRange({
        start: target.selectionStart ?? 0,
        end: target.selectionEnd ?? 0,
      });
    }
  };

  // If viewing a shared file (readOnly), default to 'preview' mode for better reading experience
  useEffect(() => {
    if (readOnly) {
      setViewMode('preview');
    } else {
      setViewMode('split');
    }
  }, [readOnly]);

  // ponytail: sync-scroll event listeners are bound to viewMode and fileType to avoid re-binding on every keystroke
  useEffect(() => {
    if (viewMode !== 'split' || fileType !== 'md') return;

    const textarea = textareaRef.current;
    const preview = previewRef.current;
    if (!textarea || !preview) return;

    let isSyncingEditor = false;
    let isSyncingPreview = false;
    let timeoutId: number | null = null;

    const handleEditorScroll = () => {
      if (isSyncingPreview) return;
      isSyncingEditor = true;
      if (timeoutId) window.clearTimeout(timeoutId);

      const maxScrollTopTextarea = textarea.scrollHeight - textarea.clientHeight;
      if (maxScrollTopTextarea > 0) {
        const ratio = textarea.scrollTop / maxScrollTopTextarea;
        preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight);
      }

      timeoutId = window.setTimeout(() => {
        isSyncingEditor = false;
      }, 50);
    };

    const handlePreviewScroll = () => {
      if (isSyncingEditor) return;
      isSyncingPreview = true;
      if (timeoutId) window.clearTimeout(timeoutId);

      const maxScrollTopPreview = preview.scrollHeight - preview.clientHeight;
      if (maxScrollTopPreview > 0) {
        const ratio = preview.scrollTop / maxScrollTopPreview;
        textarea.scrollTop = ratio * (textarea.scrollHeight - textarea.clientHeight);
      }

      timeoutId = window.setTimeout(() => {
        isSyncingPreview = false;
      }, 50);
    };

    textarea.addEventListener('scroll', handleEditorScroll, { passive: true });
    preview.addEventListener('scroll', handlePreviewScroll, { passive: true });

    return () => {
      textarea.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [viewMode, fileType]);

  // Handle syntax insertion at current cursor/selection
  const handleInsertSyntax = (prefix: string, suffix: string, defaultText = '') => {
    if (readOnly) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionRange ? selectionRange.start : textarea.selectionStart;
    const end = selectionRange ? selectionRange.end : textarea.selectionEnd;
    const text = textarea.value;

    const selectionText = text.substring(start, end);
    const replacement = prefix + (selectionText || defaultText) + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    onContentChange(newContent);

    // After state updates, focus back on the textarea and adjust cursor selection
    setTimeout(() => {
      textarea.focus();
      const insertLength = replacement.length;
      
      if (selectionText) {
        textarea.setSelectionRange(start, start + insertLength);
      } else {
        const defaultTextStart = start + prefix.length;
        const defaultTextEnd = defaultTextStart + defaultText.length;
        textarea.setSelectionRange(defaultTextStart, defaultTextEnd);
      }

      setSelectionRange({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      });
    }, 0);
  };

  // Handle local import within the editor
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onImport(file.name, content);
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Toolbar */}
      <EditorToolbar
        fileName={fileName}
        fileType={fileType}
        onInsertSyntax={handleInsertSyntax}
        onSave={onSave}
        onBack={onBack}
        onImport={handleImportFile}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        
        user={user}
        cloudNoteId={cloudNoteId}
        isPublic={isPublic}
        readOnly={readOnly}
        isCloudSaving={isCloudSaving}
        onSaveToCloud={onSaveToCloud}
        onTogglePublic={onTogglePublic}
      />

      {/* Editor Content Area */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 0, bgcolor: theme.palette.background.default }}>
        {fileType === 'txt' ? (
          // TXT Mode - Single edit screen
          <Box sx={{ height: '100%', p: 3, display: 'flex', justifyContent: 'center' }}>
            <Paper
              elevation={1}
              sx={{
                width: '100%',
                maxWidth: '900px',
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <InputBase
                multiline
                fullWidth
                value={fileContent}
                onChange={(e) => onContentChange(e.target.value)}
                inputRef={textareaRef}
                readOnly={readOnly}
                onSelect={handleSelect}
                placeholder={readOnly ? "唯讀模式：無法編輯此內容" : "在此開始輸入純文字內容..."}
                slotProps={{
                  input: {
                    readOnly: readOnly,
                    style: {
                      fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                    }
                  }
                }}
                sx={{
                  p: 4,
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  '& textarea': {
                    height: '100% !important',
                    overflowY: 'auto !important',
                  },
                }}
              />
            </Paper>
          </Box>
        ) : (
          // MD Mode - Dynamic Layout based on viewMode
          <Grid container sx={{ height: '100%', m: 0, width: '100%' }}>
            {/* Left Side: Text Editor */}
            <Grid
              size={
                viewMode === 'editor'
                  ? { xs: 12 }
                  : viewMode === 'split'
                  ? { xs: 12, md: 6 }
                  : { xs: 12 }
              }
              sx={{
                height: '100%',
                borderRight:
                  viewMode === 'split'
                    ? `1px solid ${theme.palette.divider}`
                    : 'none',
                overflow: 'hidden',
                display: viewMode === 'preview' ? 'none' : 'block',
              }}
            >
              <InputBase
                multiline
                fullWidth
                value={fileContent}
                onChange={(e) => onContentChange(e.target.value)}
                inputRef={textareaRef}
                readOnly={readOnly}
                onSelect={handleSelect}
                placeholder={readOnly ? "唯讀模式：無法編輯此內容" : "在此輸入 Markdown 內容..."}
                slotProps={{
                  input: {
                    readOnly: readOnly,
                    style: {
                      fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                      fontSize: '1rem',
                      lineHeight: 1.6,
                    }
                  }
                }}
                sx={{
                  p: 3,
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  bgcolor: theme.palette.mode === 'dark' ? '#14131a' : '#fafafa',
                  '& textarea': {
                    height: '100% !important',
                    overflowY: 'auto !important',
                  },
                }}
              />
            </Grid>

            {/* Right Side: Markdown & LaTeX Live Preview */}
            <Grid
              size={
                viewMode === 'preview'
                  ? { xs: 12 }
                  : viewMode === 'split'
                  ? { xs: 12, md: 6 }
                  : { xs: 12 }
              }
              sx={{
                height: '100%',
                overflow: 'hidden',
                display:
                  viewMode === 'preview'
                    ? 'block'
                    : viewMode === 'split'
                    ? 'block'
                    : 'none',
              }}
            >
              <MarkdownPreview 
                ref={previewRef} 
                content={fileContent} 
                isCentered={viewMode === 'preview'} 
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  IconButton,
  Tooltip,
  Backdrop,
  CircularProgress,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { getTheme } from './theme';
import { LandingPage } from './components/LandingPage';
import { EditorPage } from './components/EditorPage';
import { useAutoSave, clearCachedFile } from './hooks/useAutoSave';
import { auth, db, resolveRedirect } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'editor'>('landing');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark'); // Dark mode by default for premium look

  // Auth States
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);

  // Snackbar states
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'error' | 'warning' | 'info' | 'success' }>({
    open: false,
    msg: '',
    severity: 'info',
  });
  const showSnack = (msg: string, severity: typeof snack['severity'] = 'info') => {
    setSnack({ open: true, msg, severity });
  };

  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    body: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    body: '',
    onConfirm: () => {},
  });
  const askConfirm = (title: string, body: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, body, onConfirm });
  };


  // File States
  const [fileName, setFileName] = useState('untitled.md');
  const [fileContent, setFileContent] = useState('');
  const [fileType, setFileType] = useState<'txt' | 'md'>('md');
  const [isModified, setIsModified] = useState(false);

  // Cloud Note States
  const [cloudNoteId, setCloudNoteId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [isCloudSaving, setIsCloudSaving] = useState(false);

  // Listen to Auth State Changes + resolve any pending redirect sign-in
  useEffect(() => {
    // resolveRedirect picks up credential after signInWithRedirect page reload
    resolveRedirect().catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Parse share URL parameter once auth is resolved
  useEffect(() => {
    if (authLoading) return;

    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      const fetchSharedNote = async () => {
        setShareLoading(true);
        try {
          const noteRef = doc(db, 'notes', shareId);
          const noteSnap = await getDoc(noteRef);
          if (noteSnap.exists()) {
            const data = noteSnap.data();
            const isOwner = user ? user.uid === data.ownerId : false;

            if (data.isPublic || isOwner) {
              setCloudNoteId(shareId);
              setFileName(data.name || 'untitled.md');
              setFileContent(data.content || '');
              const cleanType = (data.type === 'txt' || data.type === 'md') ? data.type : (data.name?.endsWith('.txt') ? 'txt' : 'md');
              setFileType(cleanType);
              setIsPublic(!!data.isPublic);
              setReadOnly(!isOwner);
              setIsModified(false);
              setView('editor');
            } else {
              showSnack('您沒有權限檢閱此檔案，或該檔案已被設為不公開。', 'warning');
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } else {
            showSnack('此分享連結的檔案不存在或已被刪除。', 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error("Error fetching shared note:", error);
          showSnack('取得分享檔案時發生錯誤。', 'error');
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setShareLoading(false);
        }
      };
      fetchSharedNote();
    }
  }, [authLoading, user]);

  // Hook in auto save & accidental exit warnings (only when not in readOnly mode)
  useAutoSave({
    fileName,
    fileContent,
    fileType,
    isModified: isModified && !readOnly,
  });

  const handleOpenFile = (name: string, content: string, type: 'txt' | 'md') => {
    setCloudNoteId(null);
    setFileName(name || 'untitled.md');
    setFileContent(content || '');
    const cleanType = (type === 'txt' || type === 'md') ? type : (name?.endsWith('.txt') ? 'txt' : 'md');
    setFileType(cleanType);
    setIsPublic(false);
    setReadOnly(false);
    setIsModified(false);
    setView('editor');
  };

  const handleOpenCloudFile = (id: string, name: string, content: string, type: 'txt' | 'md', publicStatus: boolean, ownerId: string) => {
    setCloudNoteId(id);
    setFileName(name || 'untitled.md');
    setFileContent(content || '');
    const cleanType = (type === 'txt' || type === 'md') ? type : (name?.endsWith('.txt') ? 'txt' : 'md');
    setFileType(cleanType);
    setIsPublic(!!publicStatus);
    setIsModified(false);

    const isOwner = user ? user.uid === ownerId : false;
    setReadOnly(!isOwner);
    setView('editor');
  };

  const handleContentChange = (content: string) => {
    if (readOnly) return;
    setFileContent(content);
    setIsModified(true);
  };

  // Import a file while in the editor
  const handleImportFile = (name: string, content: string) => {
    if (readOnly) return;
    setFileName(name);
    setFileContent(content);
    setIsModified(true);
  };

  // Export / Download file to local disk
  const handleExportFile = () => {
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Mark as saved if we are not editing a cloud file (otherwise cloud has its own save flow)
    if (!cloudNoteId) {
      setIsModified(false);
      clearCachedFile();
    }
  };

  // Save to Firebase Firestore
  const handleSaveToCloud = async () => {
    if (!user) {
      showSnack('請先登入帳號！', 'warning');
      return;
    }
    setIsCloudSaving(true);
    try {
      if (cloudNoteId) {
        const noteRef = doc(db, 'notes', cloudNoteId);
        await updateDoc(noteRef, {
          name: fileName,
          content: fileContent,
          type: fileType,
          updatedAt: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'notes'), {
          name: fileName,
          content: fileContent,
          type: fileType,
          ownerId: user.uid,
          isPublic: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setCloudNoteId(docRef.id);
        setIsPublic(false);
      }
      setIsModified(false);
      clearCachedFile();
      showSnack('已成功儲存至雲端！', 'success');
    } catch (error) {
      console.error("Error saving to cloud:", error);
      showSnack('儲存至雲端時發生錯誤。', 'error');
    } finally {
      setIsCloudSaving(false);
    }
  };

  // Toggle note public visibility
  const handleTogglePublic = async (newVal: boolean) => {
    if (!cloudNoteId) return;
    try {
      const noteRef = doc(db, 'notes', cloudNoteId);
      await updateDoc(noteRef, {
        isPublic: newVal,
        updatedAt: serverTimestamp()
      });
      setIsPublic(newVal);
      showSnack(newVal ? '已將此筆記設為公開分享！' : '已將此筆記設為私人！', 'success');
    } catch (error) {
      console.error("Error updating sharing settings:", error);
      showSnack('變更分享設定時發生錯誤。', 'error');
    }
  };

  // Go back to homepage
  const handleBackToLanding = () => {
    if (isModified && !readOnly) {
      askConfirm(
        '返回主頁',
        '您有未儲存的變更！回主頁將會保留當前內容的暫存，但確定要現在返回主頁嗎？',
        () => {
          performBackToLanding();
        }
      );
    } else {
      performBackToLanding();
    }
  };

  const performBackToLanding = () => {
    // Clear state
    setCloudNoteId(null);
    setIsPublic(false);
    setReadOnly(false);
    setIsModified(false);

    // Remove query params from URL if viewing a shared note
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setView('landing');
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = getTheme(themeMode);

  if (authLoading || shareLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Backdrop open={true} sx={{ color: '#fff', zIndex: 9999, flexDirection: 'column', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography variant="body1">載入中，請稍候...</Typography>
        </Backdrop>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        overflowY: view === 'landing' ? 'auto' : 'hidden'
      }}>

        {/* Floating Theme Switcher */}
        {view === 'landing' && (
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
            <Tooltip title={themeMode === 'light' ? '切換深色模式' : '切換淺色模式'}>
              <IconButton onClick={toggleTheme} color="primary" sx={{ p: 1.5, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* View Switcher */}
        {view === 'landing' ? (
          <LandingPage
            onOpenFile={handleOpenFile}
            user={user}
            onOpenCloudFile={handleOpenCloudFile}
          />
        ) : (
          <EditorPage
            fileName={fileName}
            fileContent={fileContent}
            fileType={fileType}
            onContentChange={handleContentChange}
            onSave={handleExportFile}
            onBack={handleBackToLanding}
            onImport={handleImportFile}
            user={user}
            cloudNoteId={cloudNoteId}
            isPublic={isPublic}
            readOnly={readOnly}
            isCloudSaving={isCloudSaving}
            onSaveToCloud={handleSaveToCloud}
            onTogglePublic={handleTogglePublic}
          />
        )}

        {/* Confirm Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog(d => ({ ...d, open: false }))}
          slotProps={{ paper: { sx: { borderRadius: 4, p: 1, minWidth: '320px' } } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">{confirmDialog.body}</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setConfirmDialog(d => ({ ...d, open: false }))}
              color="inherit"
            >
              取消
            </Button>
            <Button
              onClick={() => {
                setConfirmDialog(d => ({ ...d, open: false }));
                confirmDialog.onConfirm();
              }}
              variant="contained"
              color="primary"
            >
              確定
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={5000}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snack.severity}
            onClose={() => setSnack(s => ({ ...s, open: false }))}
            sx={{ borderRadius: 3 }}
            variant="filled"
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

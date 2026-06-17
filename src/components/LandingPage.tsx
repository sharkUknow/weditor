import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useTheme,
  Alert,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  NoteAdd as NoteAddIcon,
  FolderOpen as FolderOpenIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Code as CodeIcon,
  Functions as FunctionsIcon,
  Save as SaveIcon,
  Google as GoogleIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
  CloudQueue as CloudIcon,
  Public as PublicIcon,
  LockOutlined as LockIcon,
} from '@mui/icons-material';
import { getCachedFile, clearCachedFile } from '../hooks/useAutoSave';
import { signInWithGoogle, logout, db, isFirebaseConfigured } from '../firebase';
import type { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface LandingPageProps {
  onOpenFile: (name: string, content: string, type: 'txt' | 'md') => void;
  user: User | null;
  onOpenCloudFile: (id: string, name: string, content: string, type: 'txt' | 'md', isPublic: boolean, ownerId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenFile, user, onOpenCloudFile }) => {
  const theme = useTheme();
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'txt' | 'md'>('md');
  const [cachedFile, setCachedFile] = useState<ReturnType<typeof getCachedFile>>(null);

  // Cloud Notes states
  const [cloudNotes, setCloudNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  // User menu anchor
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openUserMenu = Boolean(anchorEl);

  useEffect(() => {
    // Check if there is cached data
    const cached = getCachedFile();
    if (cached) {
      setCachedFile(cached);
    }
  }, []);

  // Fetch Cloud Notes when user is logged in
  useEffect(() => {
    if (!user) {
      setCloudNotes([]);
      setNotesLoading(false);
      return;
    }

    setNotesLoading(true);
    const q = query(
      collection(db, 'notes'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      notesData.sort((a: any, b: any) => {
        const timeA = a.updatedAt?.toMillis?.() || 0;
        const timeB = b.updatedAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      setCloudNotes(notesData);
      setNotesLoading(false);
    }, (error) => {
      console.error("Error fetching cloud notes:", error);
      setNotesLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const handleCreateNew = () => {
    if (!newFileName.trim()) return;
    let name = newFileName.trim();
    const ext = `.${newFileType}`;
    if (!name.endsWith(ext)) {
      name += ext;
    }
    onOpenFile(name, '', newFileType);
    setOpenNewDialog(false);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isMd = file.name.endsWith('.md');
    const isTxt = file.name.endsWith('.txt');

    if (!isMd && !isTxt) {
      alert('僅支援 .txt 與 .md 檔案！');
      return;
    }

    reader.onload = (event) => {
      const content = event.target?.result as string;
      onOpenFile(file.name, content, isMd ? 'md' : 'txt');
    };
    reader.readAsText(file);
  };

  const handleRestoreCache = () => {
    if (cachedFile) {
      onOpenFile(cachedFile.name, cachedFile.content, cachedFile.type);
    }
  };

  const handleDiscardCache = () => {
    if (window.confirm('確定要捨棄未保存的暫存檔嗎？此動作無法復原。')) {
      clearCachedFile();
      setCachedFile(null);
    }
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Google login failed:", error);
        alert('登入失敗，請稍後再試。');
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      try {
        await logout();
        handleUserMenuClose();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  const handleDeleteCloudNote = async (e: React.MouseEvent, noteId: string, noteName: string) => {
    e.stopPropagation(); // Prevent opening the note
    if (window.confirm(`確定要刪除雲端筆記「${noteName}」嗎？此動作無法復原。`)) {
      try {
        await deleteDoc(doc(db, 'notes', noteId));
      } catch (error) {
        console.error("Error deleting note:", error);
        alert('刪除檔案時發生錯誤。');
      }
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '儲存中...';
    return timestamp.toDate().toLocaleString();
  };

  return (
    <Container maxWidth="md" sx={{ pt: 8, pb: 6 }}>
      {/* Top Header: Authentication Status */}
      <Box sx={{ position: 'absolute', top: 16, right: 80, zIndex: 10 }}>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handleUserMenuClick} sx={{ p: 0.5 }}>
              <Avatar
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.primary.main}` }}
              >
                {user.displayName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openUserMenu}
              onClose={handleUserMenuClose}
              slotProps={{
                paper: {
                  sx: { borderRadius: 3, minWidth: 200, mt: 1, boxShadow: theme.shadows[4] }
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                  {user.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {user.email}
                </Typography>
              </Box>
              <MenuItem onClick={handleLogout} sx={{ py: 1.2 }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="登出帳號" />
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Button
            variant="outlined"
            onClick={handleLogin}
            startIcon={<GoogleIcon />}
            sx={{
              borderRadius: 3,
              px: 2.5,
              py: 0.8,
              borderWidth: '1.5px',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                borderWidth: '1.5px',
              }
            }}
          >
            Google 登入
          </Button>
        )}
      </Box>

      {/* Title & Introduction */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            mb: 2,
          }}
        >
          weditor
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontWeight: 400 }}>
          極簡、流暢的線上文字編輯器。支援雙欄即時預覽、LaTeX 數學公式與強大的快速語法插入工具列，讓您的寫作與筆記體驗更上一層樓。
        </Typography>
      </Box>

      {/* Firebase configuration warning */}
      {!isFirebaseConfigured && (
        <Alert
          severity="warning"
          sx={{
            mb: 4,
            borderRadius: 3,
            border: `1px solid ${theme.palette.warning.light}`,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Firebase 未設定
          </Typography>
          <Typography variant="body2" color="text.secondary">
            本專案目前未偵測到完整的 Firebase 組態變數。雲端筆記儲存、Google 登入與公開分享功能將暫時無法使用。請建立 <code>.env</code> 檔案並填入 <code>VITE_FIREBASE_*</code> 等環境變數。
          </Typography>
        </Alert>
      )}

      {/* Auto-save Recovery Alert */}
      {cachedFile && (
        <Alert
          severity="info"
          icon={<HistoryIcon />}
          sx={{
            mb: 6,
            borderRadius: 3,
            p: 2,
            border: `1px solid ${theme.palette.info.light}`,
            display: 'flex',
            alignItems: 'center',
          }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="contained" onClick={handleRestoreCache} color="info">
                恢復暫存
              </Button>
              <Button size="small" variant="outlined" onClick={handleDiscardCache} color="inherit">
                捨棄
              </Button>
            </Box>
          }
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            偵測到未保存的歷史暫存！
          </Typography>
          <Typography variant="body2" color="text.secondary">
            檔案：{cachedFile.name} (上次關閉時未儲存的編輯內容)
          </Typography>
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 6 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<NoteAddIcon />}
          onClick={() => {
            setNewFileName('');
            setOpenNewDialog(true);
          }}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          }}
        >
          開啟新檔
        </Button>

        <Button
          variant="outlined"
          component="label"
          size="large"
          startIcon={<FolderOpenIcon />}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            borderWidth: '2px',
            borderRadius: 3,
            '&:hover': {
              borderWidth: '2px',
            },
          }}
        >
          開啟舊檔
          <input
            type="file"
            accept=".txt,.md"
            hidden
            onChange={handleUploadFile}
          />
        </Button>
      </Box>

      {/* Cloud Notes Section */}
      {user && (
        <Card sx={{ mb: 6, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CloudIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>您的雲端筆記</Typography>
            </Box>
            
            {notesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : cloudNotes.length === 0 ? (
              <Box sx={{ textStyle: 'center', py: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">目前沒有雲端筆記，在編輯器中點擊「儲存至雲端」開始備份吧！</Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {cloudNotes.map((note) => (
                  <ListItem
                    key={note.id}
                    disablePadding
                    sx={{
                      mb: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: theme.palette.primary.light,
                      }
                    }}
                    secondaryAction={
                      <Tooltip title="刪除雲端筆記">
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => handleDeleteCloudNote(e, note.id, note.name)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemButton
                      onClick={() => onOpenCloudFile(
                        note.id,
                        note.name || 'untitled.md',
                        note.content || '',
                        note.type || 'md',
                        !!note.isPublic,
                        note.ownerId || ''
                      )}
                      sx={{ py: 1.5, px: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {note.type === 'md' ? <CodeIcon color="action" /> : <DescriptionIcon color="action" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{ fontWeight: 600 }}>{note.name}</Typography>
                            {note.isPublic ? (
                              <Chip
                                icon={<PublicIcon sx={{ fontSize: '14px !important' }} />}
                                label="公開分享"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '11px' }}
                              />
                            ) : (
                              <Chip
                                icon={<LockIcon sx={{ fontSize: '14px !important' }} />}
                                label="私人"
                                size="small"
                                color="default"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '11px' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={`上次更新: ${formatTimestamp(note.updatedAt)}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

      {/* Features Grid */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 4, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${theme.palette.primary.main}15`, color: theme.palette.primary.main, mb: 2 }}>
                <CodeIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                即時 Markdown 渲染
              </Typography>
              <Typography variant="body2" color="text.secondary">
                雙視窗並排編輯，完美呈現標題、列表、表格、超連結與程式碼高亮，支援熱更新。
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 4, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${theme.palette.secondary.main}15`, color: theme.palette.secondary.main, mb: 2 }}>
                <FunctionsIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                LaTeX 數學語法支援
              </Typography>
              <Typography variant="body2" color="text.secondary">
                支援行內公式與區塊公式渲染。提供常用數學符號、希臘字母快速插入工具列。
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 4, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: 'success.light' + '15', color: 'success.main', mb: 2 }}>
                <SaveIcon fontSize="large" />
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                斷電防丟失暫存
              </Typography>
              <Typography variant="body2" color="text.secondary">
                後台自動暫存編輯狀態，網頁關閉或重新整理前彈出警示提醒，萬無一失的寫作防護。
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* New File Dialog */}
      <Dialog
        open={openNewDialog}
        onClose={() => setOpenNewDialog(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 1, minWidth: '350px' }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>建立新檔案</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="檔案名稱"
            type="text"
            fullWidth
            variant="outlined"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="例如: README"
            sx={{ mb: 3, mt: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            檔案格式：
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={newFileType}
              onChange={(e) => setNewFileType(e.target.value as 'txt' | 'md')}
            >
              <FormControlLabel
                value="md"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CodeIcon fontSize="small" color="primary" /> Markdown (.md)
                  </Box>
                }
              />
              <FormControlLabel
                value="txt"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <DescriptionIcon fontSize="small" color="action" /> 純文字 (.txt)
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewDialog(false)} color="inherit">
            取消
          </Button>
          <Button
            onClick={handleCreateNew}
            variant="contained"
            disabled={!newFileName.trim()}
          >
            建立
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

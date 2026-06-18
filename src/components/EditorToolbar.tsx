import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  CircularProgress,
  Popover,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  FolderOpen as FolderOpenIcon,
  Download as DownloadIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  StrikethroughS as StrikethroughIcon,
  Code as CodeIcon,
  FormatQuote as FormatQuoteIcon,
  Link as LinkIcon,
  GridOn as GridOnIcon,
  Functions as FunctionsIcon,
  Edit as EditIcon,
  VerticalSplit as VerticalSplitIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
  Share as ShareIcon,
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  ArrowDropDown as ArrowDropDownIcon,
  FormatColorText as FormatColorTextIcon,
} from '@mui/icons-material';
import type { User } from 'firebase/auth';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexTemplate {
  name: string;
  math: string;
  prefix: string;
  suffix: string;
  defaultText?: string;
}

interface LatexCategory {
  id: string;
  label: string;
  templates: LatexTemplate[];
  gridColumns: number;
  buttonWidth: string;
}

const LATEX_CATEGORIES: LatexCategory[] = [
  {
    id: 'basic',
    label: '基礎函數',
    templates: [
      { name: '行內公式', math: '\\$f(x)\\$', prefix: '$', suffix: '$', defaultText: 'f(x)' },
      { name: '區塊公式', math: '\\$\\$f(x)\\$\\$', prefix: '\n$$\n', suffix: '\n$$\n', defaultText: 'f(x)' },
      { name: '分數', math: '\\frac{a}{b}', prefix: '\\frac{', suffix: '}{b}', defaultText: 'a' },
      { name: '平方根', math: '\\sqrt{x}', prefix: '\\sqrt{', suffix: '}', defaultText: 'x' },
      { name: 'n次方根', math: '\\sqrt[n]{x}', prefix: '\\sqrt[', suffix: ']{x}', defaultText: 'n' },
      { name: '上標', math: 'x^n', prefix: '^{', suffix: '}', defaultText: 'n' },
      { name: '下標', math: 'x_n', prefix: '_{', suffix: '}', defaultText: 'n' },
      { name: '絕對值', math: '|x|', prefix: '\\left| ', suffix: ' \\right|', defaultText: 'x' },
      { name: '圓括號', math: '(x)', prefix: '\\left( ', suffix: ' \\right)', defaultText: 'x' },
      { name: '方括號', math: '[x]', prefix: '\\left[ ', suffix: ' \\right]', defaultText: 'x' },
      { name: '花括號', math: '\\{x\\}', prefix: '\\left\\{ ', suffix: ' \\right\\}', defaultText: 'x' },
      { name: '分段函數', math: '\\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}', prefix: '\\begin{cases}\n  ', suffix: ' & x \\ge 0 \\\\\n  -x & x < 0\n\\end{cases}', defaultText: 'x' },
    ],
    gridColumns: 4,
    buttonWidth: '70px',
  },
  {
    id: 'calculus',
    label: '微積分',
    templates: [
      { name: '求和', math: '\\sum_{i=1}^{n}', prefix: '\\sum_{', suffix: '}^{n} x_i', defaultText: 'i=1' },
      { name: '求積', math: '\\prod_{i=1}^{n}', prefix: '\\prod_{', suffix: '}^{n} x_i', defaultText: 'i=1' },
      { name: '積分', math: '\\int_{a}^{b}', prefix: '\\int_{', suffix: '}^{b} f(x) dx', defaultText: 'a' },
      { name: '雙重積分', math: '\\iint', prefix: '\\iint_{', suffix: '} f(x,y) dxdy', defaultText: 'D' },
      { name: '環路積分', math: '\\oint', prefix: '\\oint_{', suffix: '} f(z) dz', defaultText: 'C' },
      { name: '微分', math: '\\frac{dy}{dx}', prefix: '\\frac{d', suffix: '}{dx}', defaultText: 'y' },
      { name: '偏微分', math: '\\frac{\\partial u}{\\partial x}', prefix: '\\frac{\\partial ', suffix: '}{\\partial x}', defaultText: 'u' },
      { name: '極限', math: '\\lim_{x \\to \\infty}', prefix: '\\lim_{', suffix: ' \\to \\infty}', defaultText: 'x' },
      { name: '梯度', math: '\\nabla', prefix: '\\nabla ', suffix: '' },
    ],
    gridColumns: 3,
    buttonWidth: '90px',
  },
  {
    id: 'greek',
    label: '希臘字母',
    templates: [
      { name: 'alpha', math: '\\alpha', prefix: '\\alpha', suffix: '' },
      { name: 'beta', math: '\\beta', prefix: '\\beta', suffix: '' },
      { name: 'gamma', math: '\\gamma', prefix: '\\gamma', suffix: '' },
      { name: 'delta', math: '\\delta', prefix: '\\delta', suffix: '' },
      { name: 'epsilon', math: '\\epsilon', prefix: '\\epsilon', suffix: '' },
      { name: 'zeta', math: '\\zeta', prefix: '\\zeta', suffix: '' },
      { name: 'eta', math: '\\eta', prefix: '\\eta', suffix: '' },
      { name: 'theta', math: '\\theta', prefix: '\\theta', suffix: '' },
      { name: 'iota', math: '\\iota', prefix: '\\iota', suffix: '' },
      { name: 'kappa', math: '\\kappa', prefix: '\\kappa', suffix: '' },
      { name: 'lambda', math: '\\lambda', prefix: '\\lambda', suffix: '' },
      { name: 'mu', math: '\\mu', prefix: '\\mu', suffix: '' },
      { name: 'nu', math: '\\nu', prefix: '\\nu', suffix: '' },
      { name: 'xi', math: '\\xi', prefix: '\\xi', suffix: '' },
      { name: 'pi', math: '\\pi', prefix: '\\pi', suffix: '' },
      { name: 'rho', math: '\\rho', prefix: '\\rho', suffix: '' },
      { name: 'sigma', math: '\\sigma', prefix: '\\sigma', suffix: '' },
      { name: 'tau', math: '\\tau', prefix: '\\tau', suffix: '' },
      { name: 'upsilon', math: '\\upsilon', prefix: '\\upsilon', suffix: '' },
      { name: 'phi', math: '\\phi', prefix: '\\phi', suffix: '' },
      { name: 'chi', math: '\\chi', prefix: '\\chi', suffix: '' },
      { name: 'psi', math: '\\psi', prefix: '\\psi', suffix: '' },
      { name: 'omega', math: '\\omega', prefix: '\\omega', suffix: '' },
      { name: 'Gamma', math: '\\Gamma', prefix: '\\Gamma', suffix: '' },
      { name: 'Delta', math: '\\Delta', prefix: '\\Delta', suffix: '' },
      { name: 'Theta', math: '\\Theta', prefix: '\\Theta', suffix: '' },
      { name: 'Lambda', math: '\\Lambda', prefix: '\\Lambda', suffix: '' },
      { name: 'Sigma', math: '\\Sigma', prefix: '\\Sigma', suffix: '' },
      { name: 'Phi', math: '\\Phi', prefix: '\\Phi', suffix: '' },
      { name: 'Psi', math: '\\Psi', prefix: '\\Psi', suffix: '' },
      { name: 'Omega', math: '\\Omega', prefix: '\\Omega', suffix: '' },
    ],
    gridColumns: 6,
    buttonWidth: '45px',
  },
  {
    id: 'relations',
    label: '關係與符號',
    templates: [
      { name: '加減', math: '\\pm', prefix: '\\pm', suffix: '' },
      { name: '減加', math: '\\mp', prefix: '\\mp', suffix: '' },
      { name: '乘', math: '\\times', prefix: '\\times', suffix: '' },
      { name: '除', math: '\\div', prefix: '\\div', suffix: '' },
      { name: '不等於', math: '\\neq', prefix: '\\neq', suffix: '' },
      { name: '約等於', math: '\\approx', prefix: '\\approx', suffix: '' },
      { name: '恆等於', math: '\\equiv', prefix: '\\equiv', suffix: '' },
      { name: '小於等於', math: '\\le', prefix: '\\le', suffix: '' },
      { name: '大於等於', math: '\\ge', prefix: '\\ge', suffix: '' },
      { name: '遠小於', math: '\\ll', prefix: '\\ll', suffix: '' },
      { name: '遠大於', math: '\\gg', prefix: '\\gg', suffix: '' },
      { name: '比例', math: '\\propto', prefix: '\\propto', suffix: '' },
      { name: '無窮大', math: '\\infty', prefix: '\\infty', suffix: '' },
      { name: '屬於', math: '\\in', prefix: '\\in', suffix: '' },
      { name: '不屬於', math: '\\notin', prefix: '\\notin', suffix: '' },
      { name: '包含於', math: '\\subseteq', prefix: '\\subseteq', suffix: '' },
      { name: '真包含於', math: '\\subset', prefix: '\\subset', suffix: '' },
      { name: '聯集', math: '\\cup', prefix: '\\cup', suffix: '' },
      { name: '交集', math: '\\cap', prefix: '\\cap', suffix: '' },
      { name: '空集', math: '\\emptyset', prefix: '\\emptyset', suffix: '' },
      { name: '因為', math: '\\because', prefix: '\\because', suffix: '' },
      { name: '所以', math: '\\therefore', prefix: '\\therefore', suffix: '' },
      { name: '任意', math: '\\forall', prefix: '\\forall', suffix: '' },
      { name: '存在', math: '\\exists', prefix: '\\exists', suffix: '' },
      { name: '邏輯非', math: '\\neg', prefix: '\\neg', suffix: '' },
      { name: '邏輯與', math: '\\land', prefix: '\\land', suffix: '' },
      { name: '邏輯或', math: '\\lor', prefix: '\\lor', suffix: '' },
      { name: '蘊含', math: '\\implies', prefix: '\\implies', suffix: '' },
      { name: '等價', math: '\\iff', prefix: '\\iff', suffix: '' },
    ],
    gridColumns: 6,
    buttonWidth: '45px',
  },
  {
    id: 'matrices',
    label: '矩陣與向量',
    templates: [
      { name: '向量 (小)', math: '\\vec{a}', prefix: '\\vec{', suffix: '}', defaultText: 'a' },
      { name: '向量 (長)', math: '\\overrightarrow{AB}', prefix: '\\overrightarrow{', suffix: '}', defaultText: 'AB' },
      { name: '點積', math: '\\cdot', prefix: '\\cdot', suffix: '' },
      { name: '叉積', math: '\\times', prefix: '\\times', suffix: '' },
      { name: '2x2 矩陣', math: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', prefix: '\\begin{pmatrix}\n  ', suffix: ' & b \\\\\n  c & d\n\\end{pmatrix}', defaultText: 'a' },
      { name: '3x3 矩陣', math: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', prefix: '\\begin{pmatrix}\n  ', suffix: ' & b & c \\\\\n  d & e & f \\\\\n  g & h & i\n\\end{pmatrix}', defaultText: 'a' },
      { name: '行列式', math: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', prefix: '\\begin{vmatrix}\n  ', suffix: ' & b \\\\\n  c & d\n\\end{vmatrix}', defaultText: 'a' },
      { name: '中括號矩陣', math: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', prefix: '\\begin{bmatrix}\n  ', suffix: ' & b \\\\\n  c & d\n\\end{bmatrix}', defaultText: 'a' },
    ],
    gridColumns: 3,
    buttonWidth: '90px',
  }
];

const PRESET_COLORS = [
  { label: '紅色', value: '#e53935' },
  { label: '橙色', value: '#fb8c00' },
  { label: '黃色', value: '#fdd835' },
  { label: '綠色', value: '#43a047' },
  { label: '藍色', value: '#1e88e5' },
  { label: '紫色', value: '#8e24aa' },
  { label: '粉紅', value: '#d81b60' },
  { label: '青色', value: '#00acc1' },
  { label: '深灰', value: '#546e7a' },
  { label: '淺灰', value: '#b0bec5' },
  { label: '黑色', value: '#000000' },
  { label: '白色', value: '#ffffff' },
];

interface EditorToolbarProps {
  fileName: string;
  fileType: 'txt' | 'md';
  onInsertSyntax: (prefix: string, suffix: string, defaultText?: string) => void;
  onSave: () => void;
  onBack: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  viewMode: 'split' | 'editor' | 'preview';
  onViewModeChange: (mode: 'split' | 'editor' | 'preview') => void;
  
  // Cloud & Sharing props
  user: User | null;
  cloudNoteId: string | null;
  isPublic: boolean;
  readOnly: boolean;
  isCloudSaving: boolean;
  onSaveToCloud: () => Promise<void>;
  onTogglePublic: (newVal: boolean) => Promise<void>;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  fileName,
  fileType,
  onInsertSyntax,
  onSave,
  onBack,
  onImport,
  viewMode,
  onViewModeChange,
  
  user,
  cloudNoteId,
  isPublic,
  readOnly,
  isCloudSaving,
  onSaveToCloud,
  onTogglePublic,
}) => {
  const theme = useTheme();
  
  // Share dialog states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Color picker popover states
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);
  const [customColor, setCustomColor] = useState('#e53935');

  // Popover states for LaTeX categories
  const [latexAnchors, setLatexAnchors] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleOpenLatexPopover = (categoryId: string, event: React.MouseEvent<HTMLElement>) => {
    setLatexAnchors((prev) => ({ ...prev, [categoryId]: event.currentTarget }));
  };

  const handleCloseLatexPopover = (categoryId: string) => {
    setLatexAnchors((prev) => ({ ...prev, [categoryId]: null }));
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/?share=${cloudNoteId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* Top Row: File Operations & File Name */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Tooltip title="回主頁">
            <IconButton onClick={onBack} color="inherit">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {fileName}
          </Typography>
          {readOnly && (
            <Typography variant="caption" sx={{ px: 1, py: 0.3, borderRadius: 1.5, bgcolor: 'action.selected', color: 'text.secondary', fontWeight: 600 }}>
              唯讀模式
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* View Mode Switcher (only for md files) */}
          {fileType === 'md' && (
            <>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_e, mode) => mode && onViewModeChange(mode)}
                size="small"
                aria-label="檢視模式"
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? '#1c1b22' : '#f0f0f5',
                  border: `1px solid ${theme.palette.divider}`,
                  p: 0.2,
                  borderRadius: 2.5,
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: 2,
                    mx: 0.2,
                    px: 1.5,
                    py: 0.5,
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.dark',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="editor" aria-label="僅編輯">
                  <Tooltip title="僅編輯區">
                    <EditIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="split" aria-label="雙欄對照">
                  <Tooltip title="雙欄對照">
                    <VerticalSplitIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="preview" aria-label="僅預覽">
                  <Tooltip title="僅預覽區">
                    <VisibilityIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.8 }} />
            </>
          )}

          {/* Import Button (hidden in readOnly) */}
          {!readOnly && (
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<FolderOpenIcon />}
              sx={{ borderRadius: 2 }}
            >
              匯入舊檔
              <input
                type="file"
                accept={fileType === 'md' ? '.md' : '.txt'}
                hidden
                onChange={onImport}
              />
            </Button>
          )}

          {/* Cloud Save Button (hidden in readOnly, shown for logged-in users) */}
          {user && !readOnly && (
            <Button
              variant="outlined"
              size="small"
              color="primary"
              disabled={isCloudSaving}
              startIcon={isCloudSaving ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
              onClick={onSaveToCloud}
              sx={{ borderRadius: 2 }}
            >
              {isCloudSaving ? '儲存中...' : '儲存至雲端'}
            </Button>
          )}

          {/* Share Button (only if note has been saved to cloud) */}
          {user && !readOnly && (
            <Tooltip title={cloudNoteId ? "設定公開分享" : "請先儲存至雲端才能開啟分享"}>
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  disabled={!cloudNoteId}
                  startIcon={<ShareIcon />}
                  onClick={() => setShareDialogOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  分享
                </Button>
              </span>
            </Tooltip>
          )}

          {/* Export / Download Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={onSave}
            sx={{ borderRadius: 2 }}
          >
            匯出下載
          </Button>
        </Box>
      </Box>

      {/* Bottom Row: Syntax Insertion (MD only, hidden in readOnly) */}
      {fileType === 'md' && !readOnly && (
        <>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.5,
              px: 2,
              py: 0.8,
              bgcolor: theme.palette.mode === 'dark' ? '#13121a' : '#fcfcff',
            }}
          >
            {/* Markdown Syntax Tools */}
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 700 }}>
              MARKDOWN:
            </Typography>
            
            <Tooltip title="粗體 (Ctrl+B)">
              <IconButton size="small" onClick={() => onInsertSyntax('**', '**', '粗體文字')}>
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="斜體 (Ctrl+I)">
              <IconButton size="small" onClick={() => onInsertSyntax('*', '*', '斜體文字')}>
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="刪除線">
              <IconButton size="small" onClick={() => onInsertSyntax('~~', '~~', '刪除文字')}>
                <StrikethroughIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="字體顏色">
              <IconButton size="small" onClick={(e) => setColorAnchor(e.currentTarget)}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FormatColorTextIcon fontSize="small" />
                  <Box sx={{ width: '16px', height: '3px', bgcolor: customColor, mt: -0.2, borderRadius: '1px' }} />
                </Box>
              </IconButton>
            </Tooltip>

            <Popover
              open={Boolean(colorAnchor)}
              anchorEl={colorAnchor}
              onClose={() => setColorAnchor(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              slotProps={{
                paper: {
                  sx: {
                    p: 1.5,
                    mt: 0.5,
                    width: '240px',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[3],
                    bgcolor: theme.palette.background.paper,
                  }
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.85rem' }}>
                常用顏色
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, mb: 1.5 }}>
                {PRESET_COLORS.map((color) => (
                  <Tooltip key={color.value} title={color.label}>
                    <Box
                      onClick={() => {
                        setCustomColor(color.value);
                        onInsertSyntax(`<span style="color: ${color.value}">`, '</span>', '彩色文字');
                        setColorAnchor(null);
                      }}
                      sx={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        bgcolor: color.value,
                        cursor: 'pointer',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: 'inset 0 0 2px rgba(0,0,0,0.2)',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          transition: 'transform 0.1s ease',
                        }
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.85rem' }}>
                自訂顏色
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    position: 'relative',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: customColor,
                  }}
                >
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    style={{
                      position: 'absolute',
                      top: -4,
                      left: -4,
                      width: '40px',
                      height: '40px',
                      opacity: 0,
                      cursor: 'pointer',
                    }}
                  />
                </Box>
                <TextField
                  size="small"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  slotProps={{
                    htmlInput: {
                      style: {
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        padding: '4px 8px',
                      }
                    }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    onInsertSyntax(`<span style="color: ${customColor}">`, '</span>', '彩色文字');
                    setColorAnchor(null);
                  }}
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                  }}
                >
                  套用
                </Button>
              </Box>
            </Popover>

            <Tooltip title="行內程式碼">
              <IconButton size="small" onClick={() => onInsertSyntax('`', '`', 'code')}>
                <CodeIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="程式碼區塊">
              <IconButton size="small" onClick={() => onInsertSyntax('\n```javascript\n', '\n```\n', 'console.log("hello");')}>
                <Box component="span" sx={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{'</>'}</Box>
              </IconButton>
            </Tooltip>

            <Tooltip title="引用區塊">
              <IconButton size="small" onClick={() => onInsertSyntax('\n> ', '', '引用文字')}>
                <FormatQuoteIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="超連結">
              <IconButton size="small" onClick={() => onInsertSyntax('[', '](https://example.com)', '連結文字')}>
                <LinkIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="插入表格">
              <IconButton size="small" onClick={() => onInsertSyntax('\n| 標題 1 | 標題 2 |\n| --- | --- |\n| 內容 1 | 內容 2 |\n', '')}>
                <GridOnIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="一級標題">
              <IconButton size="small" onClick={() => onInsertSyntax('\n# ', '', '大標題')}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>H1</Typography>
              </IconButton>
            </Tooltip>

            <Tooltip title="二級標題">
              <IconButton size="small" onClick={() => onInsertSyntax('\n## ', '', '中標題')}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>H2</Typography>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 0.5 }} />

            {/* LaTeX Math Syntax Tools */}
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1, fontWeight: 700 }}>
              LATEX 數學公式:
            </Typography>

            <Tooltip title="行內公式 ($ $)">
              <IconButton size="small" onClick={() => onInsertSyntax('$', '$', 'f(x) = x^2')}>
                <FunctionsIcon fontSize="small" color="primary" />
              </IconButton>
            </Tooltip>

            <Tooltip title="區塊公式 ($$ $$)">
              <IconButton size="small" onClick={() => onInsertSyntax('\n$$\n', '\n$$\n', '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}')}>
                <Box component="span" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                  <FunctionsIcon fontSize="small" color="primary" />
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: theme.palette.primary.main, mt: -0.5 }}>BLOCK</Typography>
                </Box>
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} />

            {LATEX_CATEGORIES.map((category) => {
              const isOpen = Boolean(latexAnchors[category.id]);
              const anchorEl = latexAnchors[category.id];
              return (
                <React.Fragment key={category.id}>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    endIcon={<ArrowDropDownIcon />}
                    onClick={(e) => handleOpenLatexPopover(category.id, e)}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 1,
                      py: 0.25,
                    }}
                  >
                    {category.label}
                  </Button>

                  <Popover
                    open={isOpen}
                    anchorEl={anchorEl}
                    onClose={() => handleCloseLatexPopover(category.id)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          p: 1.25,
                          mt: 0.5,
                          maxWidth: '400px',
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: theme.shadows[3],
                          bgcolor: theme.palette.background.paper,
                        }
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${category.gridColumns}, 1fr)`,
                        gap: 0.75,
                      }}
                    >
                      {category.templates.map((template, idx) => (
                        <Tooltip key={idx} title={`${template.name} (${template.math})`}>
                          <Button
                            size="small"
                             onClick={() => {
                               let prefix = template.prefix;
                               let suffix = template.suffix;
                               // ponytail: auto-wrap inline math delimiters if not already present, except for explicit block/inline formulas
                               if (
                                 !prefix.startsWith('$') &&
                                 !prefix.startsWith('\n$$')
                               ) {
                                 prefix = '$' + prefix;
                                 suffix = suffix + '$';
                               }
                               onInsertSyntax(prefix, suffix, template.defaultText);
                               handleCloseLatexPopover(category.id);
                             }}
                            sx={{
                              minWidth: category.buttonWidth,
                              height: '38px',
                              textTransform: 'none',
                              p: 0.5,
                              color: theme.palette.text.primary,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 1.25,
                              bgcolor: theme.palette.mode === 'dark' ? '#1c1b22' : '#f8f9fa',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                borderColor: theme.palette.primary.main,
                                '& *': {
                                  color: 'inherit !important',
                                }
                              },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              dangerouslySetInnerHTML={{
                                __html: katex.renderToString(template.math, {
                                  displayMode: false,
                                  throwOnError: false,
                                }),
                              }}
                            />
                          </Button>
                        </Tooltip>
                      ))}
                    </Box>
                  </Popover>
                </React.Fragment>
              );
            })}
          </Box>
        </>
      )}

      {/* Share settings dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: 4, p: 1, minWidth: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>分享設定</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => onTogglePublic(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography sx={{ fontWeight: 600 }}>開啟公開分享</Typography>
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              開啟後，任何人均可透過連結檢閱此筆記內容（唯讀模式，無需登入）。
            </Typography>
          </Box>

          {isPublic && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                公開連結：
              </Typography>
              <TextField
                fullWidth
                value={`${window.location.origin}/?share=${cloudNoteId}`}
                variant="outlined"
                slotProps={{
                  input: {
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleCopyLink}
                          startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                          color={copied ? "success" : "primary"}
                          sx={{ borderRadius: 2, px: 2, textTransform: 'none' }}
                        >
                          {copied ? '已複製！' : '複製'}
                        </Button>
                      </InputAdornment>
                    ),
                    style: {
                      paddingRight: 8,
                    }
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShareDialogOpen(false)} variant="contained">
            完成
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

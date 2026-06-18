import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Paper, useTheme, Box } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';

// Import KaTeX CSS for rendering math
import 'katex/dist/katex.min.css';

const highlightCode = (code: string, language?: string) => {
  if (!language || !['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript', 'html', 'css'].includes(language.toLowerCase())) {
    return code;
  }

  const tokens: { type: string; text: string }[] = [];
  const regex = /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\"|[^"])*"|'(?:\\'|[^'])*'|`(?:\\`|[^`])*`)|(\b(?:import|from|function|const|let|var|return|if|else|for|while|class|new|typeof|instanceof|async|await|try|catch|finally|throw|default|export|interface|type|extends|implements|as|any|number|string|boolean|void|null|undefined)\b)|(\b\d+\b)|([{}()\[\].,:;?+\-*/%=!&|<>]+)|(\b[a-zA-Z_]\w*\b)|(\s+)/g;

  let match;
  while ((match = regex.exec(code)) !== null) {
    const [
      text,
      comment,
      string,
      keyword,
      number,
      punct,
      word,
      space
    ] = match;

    if (comment) tokens.push({ type: 'comment', text });
    else if (string) tokens.push({ type: 'string', text });
    else if (keyword) tokens.push({ type: 'keyword', text });
    else if (number) tokens.push({ type: 'number', text });
    else if (punct) tokens.push({ type: 'punct', text });
    else if (word) tokens.push({ type: 'word', text });
    else if (space) tokens.push({ type: 'space', text });
    else tokens.push({ type: 'text', text });
  }

  if (tokens.length === 0 && code.length > 0) {
    return code;
  }

  return tokens.map((token, idx) => {
    let style: React.CSSProperties = {};
    if (token.type === 'comment') {
      style = { color: '#999988', fontStyle: 'italic' };
    } else if (token.type === 'string') {
      style = { color: '#2e7d32' };
    } else if (token.type === 'keyword') {
      style = { color: '#0086b3', fontWeight: 'bold' };
    } else if (token.type === 'number') {
      style = { color: '#099' };
    } else if (token.type === 'word') {
      if (/^(useRef|useMemo|useCallback|useContext|useState|useEffect|console|log|document|getElementById)$/.test(token.text)) {
        style = { color: '#d73a49' };
      } else if (/^[A-Z]\w*$/.test(token.text)) {
        style = { color: '#6f42c1' };
      }
    }
    return (
      <span key={idx} style={style}>
        {token.text}
      </span>
    );
  });
};

const renderHeader = (level: number, children: React.ReactNode, theme: any, isCentered?: boolean) => {
  const text = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string') return child;
      if (typeof child === 'object' && child !== null && 'props' in child) {
        return (child as any).props.children || '';
      }
      return '';
    })
    .join('');
    
  const id = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return (
    <Box
      component={`h${level}` as any}
      id={id}
      sx={{
        position: 'relative',
        '&:hover .header-anchor': {
          opacity: 0.5,
        },
      }}
    >
      <Box
        className="header-anchor"
        component="span"
        onClick={() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', `#${id}`);
          }
        }}
        sx={{
          position: 'absolute',
          left: '-24px',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0,
          transition: 'opacity 0.2s',
          cursor: 'pointer',
          color: isCentered ? '#47464f' : theme.palette.text.secondary,
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            opacity: '1 !important',
            color: isCentered ? '#673ab7' : theme.palette.primary.main,
          }
        }}
      >
        <LinkIcon sx={{ fontSize: '1rem', transform: 'rotate(-45deg)' }} />
      </Box>
      {children}
    </Box>
  );
};

interface MarkdownPreviewProps {
  content: string;
  isCentered?: boolean;
}

export const MarkdownPreview = React.forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content, isCentered = false }, ref) => {
    const theme = useTheme();

    return (
      <Paper
        ref={ref}
        elevation={0}
        sx={{
          height: '100%',
          overflowY: 'auto',
          // ponytail: forces white background in centered/preview-only mode
          bgcolor: isCentered ? '#ffffff' : theme.palette.background.paper,
          borderRadius: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: isCentered ? '850px' : '100%',
            mx: isCentered ? 'auto' : 0,
            p: isCentered ? { xs: 4, md: 6 } : 3,
            width: '100%',
            // Customized styles for markdown elements to look professional
            '&': {
              fontFamily: theme.typography.fontFamily,
              color: isCentered ? '#1b1b1f' : theme.palette.text.primary,
              lineHeight: 1.6,
            },
            '& h1': {
              fontSize: '2rem',
              fontWeight: 700,
              mt: 1,
              mb: 2,
              pb: 1,
              borderBottom: `1px solid ${isCentered ? '#e1e0e9' : theme.palette.divider}`,
            },
            '& h2': {
              fontSize: '1.5rem',
              fontWeight: 600,
              mt: 3,
              mb: 1.5,
              pb: 0.5,
              borderBottom: `1px solid ${isCentered ? '#e1e0e980' : theme.palette.divider + '80'}`,
            },
            '& h3': {
              fontSize: '1.25rem',
              fontWeight: 600,
              mt: 2.5,
              mb: 1,
            },
            '& p': {
              mb: 2,
            },
            '& a': {
              color: isCentered ? '#673ab7' : theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            '& code': {
              fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
              bgcolor: isCentered ? '#f0f0f5' : (theme.palette.mode === 'dark' ? '#2d2c35' : '#f0f0f5'),
              px: 0.8,
              py: 0.3,
              borderRadius: 1,
              fontSize: '0.9em',
            },
            '& pre': {
              bgcolor: isCentered ? '#f7f7fa' : (theme.palette.mode === 'dark' ? '#1c1b22' : '#f7f7fa'),
              p: 2,
              borderRadius: 2,
              overflowX: 'auto',
              border: `1px solid ${isCentered ? '#e1e0e9' : theme.palette.divider}`,
              mb: 2,
              '& code': {
                bgcolor: 'transparent',
                p: 0,
                fontSize: '0.875rem',
                color: 'inherit',
              },
            },
            '& blockquote': {
              borderLeft: `4px solid ${isCentered ? '#673ab7' : theme.palette.primary.main}`,
              bgcolor: isCentered ? 'rgba(103, 58, 183, 0.08)' : (theme.palette.mode === 'dark' ? `${theme.palette.primary.main}10` : `${theme.palette.primary.main}08`),
              pl: 2,
              py: 1,
              pr: 1,
              my: 2,
              borderRadius: '0 8px 8px 0',
              '& p': {
                m: 0,
              },
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              mb: 3,
              mt: 2,
            },
            '& th': {
              bgcolor: isCentered ? '#f5f5f7' : (theme.palette.mode === 'dark' ? '#25242b' : '#f5f5f7'),
              fontWeight: 'bold',
              border: `1px solid ${isCentered ? '#e1e0e9' : theme.palette.divider}`,
              p: 1.2,
              textAlign: 'left',
            },
            '& td': {
              border: `1px solid ${isCentered ? '#e1e0e9' : theme.palette.divider}`,
              p: 1.2,
            },
            '& tr:nth-of-type(even)': {
              bgcolor: isCentered ? '#fafafc' : (theme.palette.mode === 'dark' ? '#1c1b22' : '#fafafc'),
            },
            '& ul, & ol': {
              pl: 3,
              mb: 2,
            },
            '& li': {
              mb: 0.5,
            },
            // KaTeX Math Display layout adjustment
            '& .katex-display': {
              overflowX: 'auto',
              overflowY: 'hidden',
              py: 1,
            },
            '& hr': {
              border: 'none',
              borderTop: `1px solid ${isCentered ? '#e1e0e9' : theme.palette.divider}`,
              my: 3.5,
            },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            components={{
              h1: ({ children }) => renderHeader(1, children, theme, isCentered),
              h2: ({ children }) => renderHeader(2, children, theme, isCentered),
              h3: ({ children }) => renderHeader(3, children, theme, isCentered),
              h4: ({ children }) => renderHeader(4, children, theme, isCentered),
              h5: ({ children }) => renderHeader(5, children, theme, isCentered),
              h6: ({ children }) => renderHeader(6, children, theme, isCentered),
              a({ href, children, ...props }) {
                // ponytail: natively open all links in a new tab to prevent editor state loss
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                );
              },
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                if (!match) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {highlightCode(String(children || '').replace(/\n$/, ''), match[1])}
                  </code>
                );
              }
            }}
          >
            {content || '*在此輸入 Markdown 語法，右側將即時渲染預覽...*'}
          </ReactMarkdown>
        </Box>
      </Paper>
    );
  });

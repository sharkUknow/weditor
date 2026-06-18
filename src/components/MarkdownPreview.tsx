import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Paper, useTheme } from '@mui/material';

// Import KaTeX CSS for rendering math
import 'katex/dist/katex.min.css';

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview = React.forwardRef<HTMLDivElement, MarkdownPreviewProps>(
  ({ content }, ref) => {
    const theme = useTheme();

    return (
      <Paper
        ref={ref}
        elevation={0}
        sx={{
          height: '100%',
          overflowY: 'auto',
        p: 3,
        bgcolor: theme.palette.background.paper,
        borderRadius: 0,
        // Customized styles for markdown elements to look professional
        '&': {
          fontFamily: theme.typography.fontFamily,
          color: theme.palette.text.primary,
          lineHeight: 1.6,
        },
        '& h1': {
          fontSize: '2rem',
          fontWeight: 700,
          mt: 1,
          mb: 2,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
        '& h2': {
          fontSize: '1.5rem',
          fontWeight: 600,
          mt: 3,
          mb: 1.5,
          pb: 0.5,
          borderBottom: `1px solid ${theme.palette.divider}80`,
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
          color: theme.palette.primary.main,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& code': {
          fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
          bgcolor: theme.palette.mode === 'dark' ? '#2d2c35' : '#f0f0f5',
          px: 0.8,
          py: 0.3,
          borderRadius: 1,
          fontSize: '0.9em',
        },
        '& pre': {
          bgcolor: theme.palette.mode === 'dark' ? '#1c1b22' : '#f7f7fa',
          p: 2,
          borderRadius: 2,
          overflowX: 'auto',
          border: `1px solid ${theme.palette.divider}`,
          mb: 2,
          '& code': {
            bgcolor: 'transparent',
            p: 0,
            fontSize: '0.875rem',
          },
        },
        '& blockquote': {
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          bgcolor: theme.palette.mode === 'dark' ? `${theme.palette.primary.main}10` : `${theme.palette.primary.main}08`,
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
          bgcolor: theme.palette.mode === 'dark' ? '#25242b' : '#f5f5f7',
          fontWeight: 'bold',
          border: `1px solid ${theme.palette.divider}`,
          p: 1.2,
          textAlign: 'left',
        },
        '& td': {
          border: `1px solid ${theme.palette.divider}`,
          p: 1.2,
        },
        '& tr:nth-of-type(even)': {
          bgcolor: theme.palette.mode === 'dark' ? '#1c1b22' : '#fafafc',
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
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {content || '*在此輸入 Markdown 語法，右側將即時渲染預覽...*'}
      </ReactMarkdown>
    </Paper>
  );
});

import { useEffect, useRef } from 'react';

interface AutoSaveProps {
  fileName: string;
  fileContent: string;
  fileType: 'txt' | 'md';
  isModified: boolean;
}

export const useAutoSave = ({
  fileName,
  fileContent,
  fileType,
  isModified,
}: AutoSaveProps) => {
  const timeoutRef = useRef<number | null>(null);

  // Save to localStorage when content or name changes
  useEffect(() => {
    // If the content is empty and it is not modified, we don't need to auto-save immediately
    if (!isModified) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      localStorage.setItem('weditor_temp_name', fileName);
      localStorage.setItem('weditor_temp_content', fileContent);
      localStorage.setItem('weditor_temp_type', fileType);
      localStorage.setItem('weditor_has_temp', 'true');
    }, 1000); // Debounce auto-save by 1 second

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [fileName, fileContent, fileType, isModified]);

  // Hook beforeunload to prevent accidental closing when modified
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isModified) {
        const message = '您有未儲存的變更，確定要離開嗎？';
        e.preventDefault();
        // Modern browsers require setting returnValue
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isModified]);
};

// Helper functions to manage localStorage cache
export const getCachedFile = () => {
  const hasTemp = localStorage.getItem('weditor_has_temp') === 'true';
  if (!hasTemp) return null;

  return {
    name: localStorage.getItem('weditor_temp_name') || '未命名',
    content: localStorage.getItem('weditor_temp_content') || '',
    type: (localStorage.getItem('weditor_temp_type') || 'md') as 'txt' | 'md',
  };
};

export const clearCachedFile = () => {
  localStorage.removeItem('weditor_temp_name');
  localStorage.removeItem('weditor_temp_content');
  localStorage.removeItem('weditor_temp_type');
  localStorage.setItem('weditor_has_temp', 'false');
};

import { useRef, useState, useCallback, useEffect } from 'react';

// Constants for text measurement
const AVG_CHAR_WIDTH = 8; // Average character width in pixels
const LINE_HEIGHT = 24; // Line height in pixels
// Check if mobile device
const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

const CHARS_PER_LINE = 45; // Reduced from 50 to account for mobile width
const LINES_PER_PAGE = isMobile ? 12 : 14; // Further reduced lines on mobile
const MAX_CHARS_PER_PAGE = CHARS_PER_LINE * LINES_PER_PAGE;

/**
 * Simple text splitter that doesn't rely on DOM measurements
 * @param {string} content - The content to split into pages
 * @param {number} pageHeight - Height of each page in pixels (not used in this simplified version)
 * @returns {Array} Array of content chunks that fit on each page
 */
export const splitContentIntoPages = (content, pageHeight) => {
  if (!content || !content.trim()) return [''];
  
  // Split content into paragraphs (preserving empty lines as paragraph breaks)
  const paragraphs = content.split('\n');
  const pages = [];
  let currentPage = [];
  let currentLine = '';
  let lineCount = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    
    // If it's an empty line, treat it as a paragraph break
    if (paragraph.trim() === '') {
      // If we have content in the current line, add it
      if (currentLine) {
        currentPage.push(currentLine);
        currentLine = '';
        lineCount++;
        
        // Check if we're getting too close to the end of the page
        if (lineCount >= LINES_PER_PAGE - 2) {
          pages.push(currentPage.join('\n'));
          currentPage = [];
          lineCount = 0;
          continue; // Skip to next paragraph on new page
        }
      }
      
      // Add an empty line for the paragraph break if we have space
      if (lineCount < LINES_PER_PAGE - 1) {
        currentPage.push('');
        lineCount++;
      }
      
      // If we've reached the max lines per page, start a new page
      if (lineCount >= LINES_PER_PAGE - 2) { // Be more aggressive with page breaks
        pages.push(currentPage.join('\n'));
        currentPage = [];
        lineCount = 0;
      }
      continue;
    }
    
    // Process non-empty paragraphs
    const words = paragraph.split(' ');
    
    for (const word of words) {
      // If adding this word would exceed the line length
      if (currentLine && (currentLine.length + word.length + 1) > CHARS_PER_LINE) {
        currentPage.push(currentLine);
        currentLine = word;
        lineCount++;
        
        // If we've reached the max lines per page, start a new page
        if (lineCount >= LINES_PER_PAGE) {
          pages.push(currentPage.join('\n'));
          currentPage = [];
          lineCount = 0;
        }
      } else {
        currentLine = currentLine ? (currentLine + ' ' + word) : word;
      }
    }
    
    // Add the current line to the page
    if (currentLine) {
      currentPage.push(currentLine);
      lineCount++;
      currentLine = '';
    }
    
    // Add a new line after each paragraph (except the last one)
    if (i < paragraphs.length - 1) {
      currentPage.push('');
      lineCount++;
    }
    
    // If we're getting close to the page limit, start a new page
    if (lineCount >= LINES_PER_PAGE - 2) { // Leave some room for the next paragraph
      pages.push(currentPage.join('\n'));
      currentPage = [];
      lineCount = 0;
    }
  }
  
  // Add the last line if there's any remaining
  if (currentLine) {
    currentPage.push(currentLine);
  }
  
  // Add the last page if there's any content left
  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n'));
  }
  
  return pages.length > 0 ? pages : [''];
};

/**
 * Simple hook for text splitting that doesn't rely on DOM measurements
 * @param {string} content - The content to split into pages
 * @param {string} className - CSS class for styling measurements (not used in this version)
 * @param {number} pageHeight - Height of each page in pixels
 * @returns {Object} { pages, recalculate }
 */
export const useSimpleTextSplitter = (content, className, pageHeight = 500) => {
  const [pages, setPages] = useState(['']);
  
  const recalculate = useCallback(() => {
    const newPages = splitContentIntoPages(content, pageHeight);
    setPages(newPages);
  }, [content, pageHeight]);
  
  // Recalculate when content or pageHeight changes
  useEffect(() => {
    recalculate();
  }, [recalculate]);
  
  return { pages, recalculate };
};

// For backward compatibility
export const useResponsiveTextSplitter = useSimpleTextSplitter;

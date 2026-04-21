/**
 * OnExam_TextCleaner.js
 * Specialized utility for cleaning extracted PDF text before AI processing.
 */

const cleanExtractedText = (text) => {
    if (!text) return "";

    // 1. Remove common headers/footers patterns (e.g. Page 1, Slide 1)
    let cleaned = text.replace(/Page \d+/gi, '');
    cleaned = cleaned.replace(/Slide \d+/gi, '');
    
    // 2. Remove repeated company/university names if they appear isolated (mock example)
    // cleaned = cleaned.replace(/UniHub University/gi, ''); 

    // 3. Normalize whitespace (remove excessive newlines/tabs)
    cleaned = cleaned.replace(/\s+/g, ' ');

    // 4. Remove obvious noise like isolated page numbers or footer symbols
    cleaned = cleaned.replace(/\[\d+\]/g, ''); 

    // 5. Trim and return
    return cleaned.trim();
};

module.exports = { cleanExtractedText };

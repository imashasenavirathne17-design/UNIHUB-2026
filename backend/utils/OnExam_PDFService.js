const fs = require('fs').promises;
const { PdfReader } = require("pdfreader");

const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        if (!dataBuffer || dataBuffer.length < 10) throw new Error("File is too small or corrupted.");
        
        // Basic PDF header verification
        if (dataBuffer.toString('utf8', 0, 4) !== '%PDF') throw new Error("Not a valid PDF document.");

        // Accumulate text using pdfreader (Event-driven extraction)
        return new Promise((resolve, reject) => {
            let extractedText = "";
            new PdfReader().parseBuffer(dataBuffer, (err, item) => {
                if (err) {
                    console.error("PdfReader Exception:", err);
                    return reject(new Error("PDF Parsing failed."));
                }
                
                if (!item) {
                    // Extraction complete
                    resolve(extractedText);
                } else if (item.text) {
                    // Add text snippet with space to prevent word joining
                    extractedText += item.text + " ";
                }
            });
        });

    } catch (error) {
        console.error("Unified Extraction Hub Error:", error.message);
        throw new Error(`PDF Analytics Engine Failure: ${error.message}`);
    }
};

module.exports = { extractTextFromPDF };

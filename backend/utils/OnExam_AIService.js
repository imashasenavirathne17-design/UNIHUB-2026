const { GoogleGenerativeAI } = require("@google/generative-ai");
const { cleanExtractedText } = require("./OnExam_TextCleaner");
const { buildMCQPrompt } = require("./OnExam_PromptBuilder");
require('dotenv').config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const generateMCQsFromText = async (rawText, count = 10, isRegen = false) => {
    if (!genAI || process.env.GEMINI_API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
        console.warn("CRITICAL: GEMINI_API_KEY is missing. Using Multi-Concept Mock Engine.");
        
        const mockTemplates = [
            { question: "(API KEY MISSING) [Data Layer] Which storage strategy is primarily optimized for low-latency retrieval in real-time systems?", options: ["Disk-Based Persistence", "In-Memory Caching", "Cold Storage Tiering", "Distributed File Systems"], answer: "In-Memory Caching" },
            { question: "(API KEY MISSING) [Security Node] How does the system primarily handle cross-origin resource authorization?", options: ["CORS Pre-Flight Validation", "Binary Token Encryption", "Stateless Session Routing", "Manual IP Whitelisting"], answer: "CORS Pre-Flight Validation" },
            { question: "(API KEY MISSING) [UI Engine] What is the benefit of implementing Virtual DOM reconciliation in high-frequency dashboards?", options: ["Minimal Component Re-renders", "Direct Manipulation of Native Nodes", "Automatic SEO Optimization", "Server-Side Style Injection"], answer: "Minimal Component Re-renders" },
            { question: "(API KEY MISSING) [Logic Tier] Which pattern is used to decouple business logic from external integration points?", options: ["Singleton Registry", "Adapter Pattern", "Composite Layout", "Legacy Monolith"], answer: "Adapter Pattern" },
            { question: "(API KEY MISSING) [Performance] How can we reduce the payload size in high-traffic administrative interfaces?", options: ["Asset Gzipping", "Full Texture Loading", "Redundant Data Polling", "Synchronous IO Blocking"], answer: "Asset Gzipping" }
        ];

        // Ensure we fulfill the TARGET VOLUME exactly
        const fullVolumeResult = Array.from({ length: count }).map((_, i) => {
            const template = mockTemplates[i % mockTemplates.length];
            return {
                ...template,
                question: i < mockTemplates.length ? template.question : `(API KEY MISSING) [Concept ${i + 1}] New Concept from Material Segment ${Math.floor(i/5) + 1}...`
            };
        });

        return fullVolumeResult;
    }

    try {
        // 1. CONTENT PREPROCESSING
        const text = cleanExtractedText(rawText);
        console.log(`AI (Gemini): Analyzing material (Length: ${text.length})... Processing ${count} questions.`);

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 2. IMPROVED PROMPT CONSTRUCTION
        const prompt = buildMCQPrompt(text, count, isRegen);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text().trim();

        // Strip markdown blocks if present
        if (content.startsWith('```')) {
            content = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        }

        let questions = JSON.parse(content);
        if (!Array.isArray(questions)) questions = questions.questions || [];

        // 3. QUALITY VALIDATION & FILTERING
        const validated = questions.filter((q, index, self) => {
            // Uniqueness check
            const isFirst = self.findIndex(t => t.question === q.question) === index;
            // Structural check
            const hasOptions = q.options && q.options.length === 4;
            const hasAnswer = q.answer && q.options.includes(q.answer);
            return isFirst && hasOptions && hasAnswer;
        });

        console.log(`Validated ${validated.length}/${questions.length} candidates.`);
        return validated;

    } catch (error) {
        console.error("Gemini Critical Engine Failure:", error.message);
        return Array.from({ length: count }).map((_, i) => ({
            question: `(Simulated Retrieval) Question ${i + 1} from content?`,
            options: [`Option Alpha`, `Option Beta`, `Option Gamma`, `Option Delta`],
            answer: `Option Alpha`
        }));
    }
};

module.exports = { generateMCQsFromText };

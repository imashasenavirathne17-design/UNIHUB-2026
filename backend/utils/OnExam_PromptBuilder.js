/**
 * OnExam_PromptBuilder.js
 * Generates the strict, university-level questioning strategy for Gemini.
 */

const buildMCQPrompt = (text, count = 10, isRegen = false) => {
    // Instruction for variety and coverage
    const varietyInstruction = isRegen 
        ? "STRICTLY generate DIFFERENT questions than before, focusing on different sections and nuances of the text."
        : "Extract key concepts, definitions, processes, and examples from different sections to ensure coverage.";

    return `
        Act as a university-level exam paper setter.
        
        You are given lecture material extracted from a PDF.
        Generate exactly ${count} Multiple-Choice Questions (MCQs) ONLY from the given content.

        STRICT RULES:
        - Do NOT use outside knowledge.
        - Do NOT create generic questions.
        - Questions MUST be directly based on the provided content.
        - ${varietyInstruction}
        - Focus on key concepts, definitions, processes, and examples mentioned.
        
        Generate a balanced mix of:
        1. Concept-based questions
        2. Definition-based questions
        3. Application-based questions
        4. Scenario-based questions (if applicable)

        EACH QUESTION MUST INCLUDE:
        - Clear, professionally phrased question.
        - Exactly 4 options (A, B, C, D).
        - Exactly ONE correct answer.
        - Realistic distractors (wrong answers) that sound plausible.

        AVOID:
        - Repeating the same concept.
        - Obvious or trivial answers.
        - Irrelevant or vague questioning.

        RETURN ONLY A RAW JSON ARRAY:
        [
          { "question": "...", "options": ["A", "B", "C", "D"], "answer": "A" }
        ]

        LECTURE CONTENT:
        ----------------
        ${text.slice(0, 45000)}
        ----------------
    `;
};

module.exports = { buildMCQPrompt };

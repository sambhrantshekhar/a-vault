const fs = require('fs');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Helper to parse PDF text
const extractText = async (filePath) => {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
};

exports.preSubmitCheck = async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'File is required' });
    }

    try {
        const text = await extractText(file.path);

        // Call OpenAI API for pre-submission checks
        const prompt = `You are an AI Helper for students. Analyze the following assignment submission draft. 
    Do NOT rewrite the work for them. Instead:
    1. Estimate a potential marks range (e.g., 70-80%).
    2. Identify missing concepts or weak explanations.
    3. Suggest structural improvements.
    
    Student Submission Text:
    """${text.substring(0, 3000)}"""  // limited for token size
    `;

        // Commented out actual call to prevent dummy key failure during tests if no key is provided.
        /*
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        });
        const feedback = response.choices[0].message.content;
        */

        const feedback = "This is a mock AI feedback because a valid OPENAI_API_KEY might not be set. \n- Estimate: 80-90%\n- Missing concepts: elaborated conclusion\n- Structural Improvements: Add headings.";

        // Cleanup the uploaded file as it's just a pre-check
        fs.unlinkSync(file.path);

        res.json({ feedback });
    } catch (err) {
        console.error(err);
        if (file) fs.unlinkSync(file.path);
        res.status(500).json({ error: 'Error processing AI check' });
    }
};

exports.autoGradeHint = async (req, res) => {
    const { submission_text, model_answer, max_marks } = req.body;

    if (!submission_text || !model_answer || !max_marks) {
        return res.status(400).json({ error: 'Missing parameters for auto grading' });
    }

    try {
        const prompt = `You are a teacher AI assistant. 
    Compare the student's submission to the model answer. Maximum marks: ${max_marks}.
    1. Evaluate conceptual alignment, keywords, and completeness.
    2. Provide a suggested mark out of ${max_marks}.
    3. Provide a confidence percentage (1-100%).
    4. Provide a justification summary.

    Model Answer:
    """${model_answer}"""
    
    Student Submission:
    """${submission_text}"""
    `;

        /*
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        });
        const result = response.choices[0].message.content;
        */

        const result = {
            suggested_marks: max_marks * 0.85,
            confidence: 90,
            justification: "Mock AI Justification: The student covered most points but missed a few finer details."
        };

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating AI grading hint' });
    }
};

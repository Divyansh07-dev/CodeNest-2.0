const { GoogleGenerativeAI } = require("@google/generative-ai");

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;

    if (!process.env.GEMINI_KEY) {
      throw new Error("GEMINI_KEY is not set in environment variables");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    const systemPrompt = `
You are an expert Data Structures and Algorithms (DSA) tutor. Your main goal is to help the user solve the CURRENT PROBLEM.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title || "Untitled Problem"}
[PROBLEM_DESCRIPTION]: ${description || ""}
[EXAMPLES / TEST CASES]: ${testCases || ""}
[START CODE / TEMPLATE]: ${startCode || ""}

## RULES:
- Stay focused on helping solve or understand the CURRENT problem.
- You may briefly explain basic programming/DSA concepts (arrays, loops, variables, conditionals, etc.) **ONLY IF** it clearly helps the user understand or solve the current problem.
- If a question is too general or unrelated, politely redirect back to the current problem. Example:
  "That's a good question! How do you think [concept] could help us solve '${title}'?"
- Never solve unrelated problems or go deeply into off-topic subjects.
- When giving hints: break the problem into small steps, ask guiding questions
- When reviewing code: point out bugs + explain why + suggest better style/efficiency
- When showing solutions (only if explicitly asked): explain approach → clean code → complexity

## RESPONSE STYLE:
- Clear, encouraging, educational
- Use code blocks with proper language (e.g. \`\`\`javascript)
- Explain "why" things work
- Help user think — don't just give answers
`.trim();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",           // ← this works in Feb 2026 (stable & fast)
      // Alternatives if 2.5-flash still 404 on your key:
      // model: "gemini-2.5-flash-lite",
      // model: "gemini-2.5-pro",
      // model: "gemini-2.5-flash-preview-05-20",   // example preview name
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: messages,
      generationConfig: {
        temperature: 0.3,          // lower = more focused & code-friendly
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const responseText = result.response.text();

    return res.status(200).json({
      message: "Success",
      response: responseText,
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    console.error("Full error:", JSON.stringify(err, null, 2));
    console.error("Request body:", req.body);

    let userMessage = "Sorry, something went wrong with the AI. Please try again later.";

    if (err?.message?.includes("not found") || err?.message?.includes("404")) {
      userMessage = "Server issue: Gemini model not available right now. Please contact support.";
    } else if (err?.message?.includes("API_KEY") || err?.message?.includes("key")) {
      userMessage = "Server configuration error: Invalid or missing Gemini API key.";
    }

    return res.status(500).json({
      error: err.message || "Internal server error",
      details: userMessage,
    });
  }
};

module.exports = solveDoubt;
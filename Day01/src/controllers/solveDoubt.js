const { GoogleGenerativeAI } = require("@google/generative-ai");

const solveDoubt = async (req, res) => {
  try {
    const { messages, title, description, testCases, startCode } = req.body;

    if (!process.env.GEMINI_KEY) {
      throw new Error("GEMINI_KEY is missing in .env");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

    const systemPrompt = `
You are an expert Data Structures and Algorithms (DSA) tutor.

CURRENT PROBLEM:
Title: ${title || "Untitled"}

Description:
${description || ""}

Test Cases:
${testCases || ""}

Start Code:
${startCode || ""}

Rules:
- Stay focused on the current problem
- Give hints and explanations
- Explain bugs clearly
- Only provide full solution if explicitly asked
- Be educational and concise
`;

   const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: systemPrompt,
});

    // Convert frontend messages into Gemini format
    const formattedMessages = messages.map((msg) => ({
      role:
        msg.role === "assistant" || msg.role === "model"
          ? "model"
          : "user",

      parts: [
        {
          text:
            msg.parts?.[0]?.text ||
            msg.content ||
            msg.text ||
            "",
        },
      ],
    }));

    const result = await model.generateContent({
      contents: formattedMessages,

      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    const responseText = result.response.text();

    return res.status(200).json({
      success: true,
      response: responseText,
    });

  } catch (err) {
    console.error("Gemini Error:", err);

    return res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
};

module.exports = solveDoubt;
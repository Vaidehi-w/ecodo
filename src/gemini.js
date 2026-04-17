import axios from "axios";

const API_KEY = "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";

export const getEcoInsight = async (text) => {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo", // ya koi bhi free model
        messages: [
          {
            role: "user",
            content: `Eco analysis: ${text}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content;
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    return "AI unavailable";
  }
};
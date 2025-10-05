export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  const { text, style } = req.body;
  if (!text || !style) {
    return res.status(400).json({ error: "Missing text or style" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: `Rewrite the following text in style: ${style}` },
          { role: "user", content: text }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    const data = await response.json();
    const rewritten = data.choices[0].message.content.trim();
    res.status(200).json({ result: rewritten });
  } catch (error) {
    console.error("Rewrite error:", error);
    res.status(500).json({ error: "Rewrite failed" });
  }
}

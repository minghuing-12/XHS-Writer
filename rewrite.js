module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { sentences = [], style = "xiaohongshu" } = req.body || {};
    if (!Array.isArray(sentences) || sentences.length !== 6) {
      return res.status(400).json({ error: "sentences 必须是长度为 6 的数组" });
    }

    const clean = sentences.map(s => (s || "").toString().trim());
    const styleGuide = getStyleGuide(style);

    const instructions = [
      "你是一个顶级中文小红书写手，风格偏【干货利落】。",
      "规则：不改变原意、不加新信息；每条只输出一句；不编号不解释；返回严格 JSON：{\"rewrites\":[6个字符串]}；空句保持空。",
      "风格：少废话、少铺垫、句子紧凑、不油不夸张，像在给结论和要点。",
      "补充风格：",
      styleGuide
    ].join("\n");

    const input = "请改写以下 6 句（可能有空句）：\n" + JSON.stringify(clean);

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5.2",
        instructions,
        input
      })
    });

    if (!openaiRes.ok) {
      const text = await openaiRes.text().catch(() => "");
      return res.status(openaiRes.status).send(text || "OpenAI error");
    }

    const data = await openaiRes.json();
    const outputText = (data.output_text || "").trim();

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      return res.status(200).json({ rewrites: clean.map(() => ""), raw: outputText, note: "model_not_json" });
    }

    const rewrites = Array.isArray(parsed.rewrites) ? parsed.rewrites : [];
    const fixed = Array.from({ length: 6 }).map((_, i) => clean[i] ? (rewrites[i] || "") : "");
    return res.status(200).json({ rewrites: fixed });
  } catch (err) {
    return res.status(500).json({ error: err.message || "server error" });
  }
};

function getStyleGuide(style) {
  if (style === "whatsapp") return "更口语、更短句、更像朋友讲话，避免营销腔。";
  if (style === "formal") return "更商务、更正式，不要网络梗，表达更完整。";
  return "自然顺口，像真人分享干货，不堆辞藻。";
}

export default async function handler(req, res) {
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
      "核心规则：",
      "1) 绝对不改变原意，不添加新信息、不删关键条件",
      "2) 允许调整语序、替换同义词、口语化，但保持信息一致",
      "3) 每条只输出一句话，不要编号，不要解释",
      "4) 必须返回 JSON，格式：{\"rewrites\":[...6个字符串...]}",
      "5) 对于空字符串，rewrites 对应位置也输出空字符串",
      "",
      "风格要求：",
      styleGuide,
      "",
      "额外要求（干货利落版）：",
      "- 少废话、少铺垫，句子更紧凑",
      "- 不要硬塞表情符号",
      "- 尽量避免‘很厉害/超绝/必看’这种夸张词",
      "- 更像在给结论和要点"
    ].join("\n");

    const input = [
      "请改写以下 6 句（可能有空句）：",
      JSON.stringify(clean)
    ].join("\n");

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
      // 容错：如果没给 JSON，就退化成按行拆分
      const lines = outputText.split("\n").map(x => x.trim()).filter(Boolean);
      const rewrites = Array.from({ length: 6 }).map((_, i) => clean[i] ? (lines[i] || "") : "");
      return res.status(200).json({ rewrites, raw: outputText, note: "fallback_lines" });
    }

    const rewrites = Array.isArray(parsed.rewrites) ? parsed.rewrites : [];
    const fixed = Array.from({ length: 6 }).map((_, i) => clean[i] ? (rewrites[i] || "") : "");

    return res.status(200).json({ rewrites: fixed });
  } catch (err) {
    return res.status(500).json({ error: err.message || "server error" });
  }
}

function getStyleGuide(style) {
  if (style === "whatsapp") {
    return [
      "- 更口语、更短句",
      "- 更像跟朋友讲话",
      "- 避免太‘营销腔’"
    ].join("\n");
  }
  if (style === "formal") {
    return [
      "- 更商务、更正式",
      "- 不要俚语/网络梗",
      "- 句子更完整、更清晰"
    ].join("\n");
  }
  return [
    "- 自然、顺口、像真人",
    "- 读起来像在分享干货，不像AI在背稿",
    "- 以清晰表达为主，不要堆辞藻"
  ].join("\n");
}

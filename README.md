# 6格小红书改写网页系统（小白版）

你已经拿到完整代码了（index.html + 后端 API）。

## 你要准备什么？
1) 一个 GitHub 账号（免费）
2) 一个 Vercel 账号（用 GitHub 登录即可，免费）
3) 一个 OpenAI API Key（在 OpenAI 平台创建）

## 最简单上线步骤（照做就行）
### A. 上传到 GitHub
1. 在电脑解压这个 zip
2. 打开 https://github.com/new 建一个仓库（Repository），随便取名
3. 用网页上传（Upload files）把解压后的 **全部文件** 上传：index.html / vercel.json / api/rewrite.js
4. 点 Commit

### B. Vercel 一键部署
1. 打开 https://vercel.com/new
2. 选择你刚刚的 GitHub Repo → Import
3. 在 Environment Variables 加：
   - Key: OPENAI_API_KEY
   - Value: 你的 OpenAI API Key
4. 点击 Deploy

### C. 打开网址使用
部署完成后，Vercel 会给你一个网址。
以后你在任何电脑打开这个网址就能用。

## 常见问题
- 如果你不想用 OpenAI API Key，就没法自动 AI 改写（因为需要调用模型）。
- Key 只放在 Vercel 后端环境变量里，不会暴露在网页前端。

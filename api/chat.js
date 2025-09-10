import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { question } = req.body;

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `你是一个专业的日语学习助手，专门帮助学生准备JLPT N2考试。请用中文回答以下日语学习问题，提供具体、实用的建议：

${question}

请注意：
1. 如果涉及词汇问题，请提供词汇的读音、意思和例句
2. 如果涉及语法问题，请解释用法和提供对比
3. 如果涉及学习方法，请给出具体可行的步骤
4. 回答要针对N2水平，不要太简单也不要太难`
      }]
    });

    res.status(200).json({ 
      response: message.content[0].text 
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: '抱歉，AI助手暂时无法回答，请稍后再试。' 
    });
  }
}

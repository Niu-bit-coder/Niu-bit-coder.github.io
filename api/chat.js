import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // 使用 Gemini 2.5 Pro 模型
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `你是一个专业的日语学习助手，专门帮助学生准备JLPT N2考试。请用中文回答以下日语学习问题，提供具体、实用的建议：

${question}

请注意：
1. 如果涉及词汇问题，请提供词汇的读音、意思和例句
2. 如果涉及语法问题，请解释用法和提供对比
3. 如果涉及学习方法，请给出具体可行的步骤
4. 回答要针对N2水平，不要太简单也不要太难
5. 请用清晰、结构化的方式回答，使用适当的段落分隔`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ 
      response: text 
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // 更详细的错误处理
    let errorMessage = '抱歉，AI助手暂时无法回答，请稍后再试。';
    
    if (error.message) {
      console.error('Error details:', error.message);
      if (error.message.includes('API_KEY')) {
        errorMessage = 'API密钥配置错误，请检查设置。';
      } else if (error.message.includes('quota')) {
        errorMessage = 'API调用次数已达上限，请稍后再试。';
      } else if (error.message.includes('model')) {
        errorMessage = '模型调用失败，请检查模型配置。';
      }
    }
    
    res.status(500).json({ 
      error: errorMessage 
    });
  }
}

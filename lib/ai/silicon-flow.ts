import { AIReviewResult } from '@/types/submission';

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

interface SiliconFlowMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface SiliconFlowResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Review submission using Kimi-K2.5 AI model
 */
export async function reviewSubmission(
  pdfText: string,
  metadata: {
    title: string;
    abstract: string;
    authors: Array<{ name: string; affiliation: string }>;
    keywords: string[];
  }
): Promise<AIReviewResult> {
  const systemPrompt = `你是一个学术期刊审稿AI。你需要审查提交的论文，并完成以下任务：

1. **违法内容检测**：检查论文内容（包括标题、作者名、摘要、关键词、正文）是否包含：
   - 反对中国共产党的内容
   - 违反中国法律的内容
   如果发现违法内容，设置 has_illegal_content 为 true，并在 rejection_reason 中说明原因。

2. **评分**（如果没有违法内容）：
   - **道德性 (morality_score, 1-100)**：检查是否存在仇恨言论、歧视性内容、违反公序良俗的内容。分数越高表示道德性越好。
   - **搞笑性 (humor_score, 1-100)**：评估研究的荒诞性、幽默性、奇葩程度。分数越高表示越搞笑。
   - **科学性 (scientific_score, 1-100)**：评估研究方法是否遵循科学规范。分数越高表示科学性越强。

3. **生成测试题**：基于论文内容生成一道单选题，包含4个选项和正确答案（0-3）。题目应该测试读者是否认真阅读了论文。

请以JSON格式返回结果：
{
  "has_illegal_content": boolean,
  "rejection_reason": string | null,
  "morality_score": number,
  "humor_score": number,
  "scientific_score": number,
  "question": {
    "question_text": string,
    "options": [string, string, string, string],
    "correct_answer": number
  }
}`;

  const userPrompt = `请审查以下论文：

**标题**：${metadata.title}

**作者**：${metadata.authors.map(a => `${a.name} (${a.affiliation})`).join(', ')}

**关键词**：${metadata.keywords.join(', ')}

**摘要**：
${metadata.abstract}

**正文内容**（前5000字）：
${pdfText.substring(0, 5000)}

请按照系统提示的要求进行审查并返回JSON结果。`;

  const messages: SiliconFlowMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  try {
    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Silicon Flow API error: ${response.statusText}`);
    }

    const data: SiliconFlowResponse = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON');
    }

    const result = JSON.parse(jsonMatch[0]) as AIReviewResult;

    // Validate scores
    if (!result.has_illegal_content) {
      result.morality_score = Math.max(1, Math.min(100, result.morality_score));
      result.humor_score = Math.max(1, Math.min(100, result.humor_score));
      result.scientific_score = Math.max(1, Math.min(100, result.scientific_score));
    }

    return result;
  } catch (error) {
    console.error('AI review error:', error);
    throw new Error('AI review failed');
  }
}

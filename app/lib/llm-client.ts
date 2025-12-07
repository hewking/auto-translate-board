export interface LLMConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export async function* translateTextStream(
  text: string,
  targetLang: 'zh' | 'en',
  config: LLMConfig
): AsyncGenerator<string, void, unknown> {
  const { apiKey, baseUrl, model } = config;

  if (!text.trim()) return;

  // Auto-detect override logic implicit in prompt: 
  // If we want "smart" auto-detect, the prompt could be:
  // "You are a translator. If the text is Chinese, translate to English. If English, translate to Chinese. Output ONLY the translation."
  // Let's use the explicit targetLang for now as per plan, but the prompt below is flexible.
  
  const systemPrompt = "You are a professional simultaneous interpreter. Your task is to translate the input text immediately and accurately. \n" +
    "Rules:\n" +
    "1. If the input is Chinese, translate to English.\n" +
    "2. If the input is English, translate to Chinese.\n" +
    "3. Output ONLY the translated text. Do not include notes or explanations.\n" +
    "4. Maintain the tone and context.";

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LLM API Error:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices[0]?.delta?.content || '';
            if (content) yield content;
          } catch (e) {
            console.warn('Error parsing stream chunk', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Translation error:', error);
    yield '[Translation Error]';
  }
}

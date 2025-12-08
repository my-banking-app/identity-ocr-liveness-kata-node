import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/env';
import logger from '../../utils/logger';

export class LlmProviderService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private provider: string;

  constructor() {
    this.provider = config.llm.provider;
    if (this.provider === 'openai') {
      // Initialize only if key is present, otherwise warn
      if (config.llm.openaiApiKey) {
        this.openai = new OpenAI({ apiKey: config.llm.openaiApiKey });
      } else {
        logger.warn('OpenAI API Key is missing');
      }
    } else if (this.provider === 'anthropic') {
      if (config.llm.anthropicApiKey) {
        this.anthropic = new Anthropic({ apiKey: config.llm.anthropicApiKey });
      } else {
        logger.warn('Anthropic API Key is missing');
      }
    }
  }

  async generateCompletion(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      if (this.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: config.llm.model,
          messages: [
            { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          temperature: config.llm.temperature,
          max_tokens: config.llm.maxTokens,
        });
        return response.choices[0].message.content || '';
      } else if (this.provider === 'anthropic' && this.anthropic) {
         const response = await this.anthropic.messages.create({
            model: config.llm.model,
            max_tokens: config.llm.maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: prompt }]
         });
         
         if (response.content && response.content.length > 0) {
             const textBlock = response.content.find(b => b.type === 'text');
             if (textBlock && 'text' in textBlock) {
                 return textBlock.text;
             }
         }
         return '';
      }
      
      // Fallback or error if provider not configured
      logger.error('LLM provider not correctly configured or initialized');
      return 'Error: LLM provider not available';
    } catch (error) {
      logger.error('Error generating LLM completion', { error });
      throw error;
    }
  }
    
  async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
      const jsonSystemPrompt = (systemPrompt || '') + '\nIMPORTANT: You must respond with a valid JSON object only. Do not include any explanation or markdown code blocks.';
      const response = await this.generateCompletion(prompt, jsonSystemPrompt);
      try {
          // Clean up code blocks if present (common with LLMs)
          const jsonStr = response.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          return JSON.parse(jsonStr);
      } catch (e) {
          logger.error('Failed to parse LLM JSON response', { response });
          throw new Error('LLM response was not valid JSON');
      }
  }
}

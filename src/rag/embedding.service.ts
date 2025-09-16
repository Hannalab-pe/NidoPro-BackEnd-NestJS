// src/rag/embedding.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      // Limpiar el texto antes de crear embedding
      const cleanText = this.cleanText(text);
      
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: cleanText,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`Error creating embedding: ${error.message}`);
    }
  }

  private cleanText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
      .slice(0, 8000); // Límite de tokens de OpenAI
  }

  // Función para calcular similitud coseno (usaremos después)
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
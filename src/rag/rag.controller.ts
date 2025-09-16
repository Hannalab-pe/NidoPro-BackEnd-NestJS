// src/rag/rag.controller.ts
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { RAGService } from './rag.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ajusta la ruta según tu estructura

@Controller('rag')
export class RAGController {
  constructor(private ragService: RAGService) {}

    // src/rag/rag.controller.ts - CORRECCIÓN
    @Post('chat')
    @UseGuards(JwtAuthGuard)
    async chat(@Body() body: { message: string }, @Request() req: any) {
    
    const userId = req.user.idUsuario; // ✅ CAMBIAR de .sub a .idUsuario
    
    const response = await this.ragService.chatWithContext(body.message, userId);
    return { response, timestamp: new Date().toISOString() };
    }

  // Endpoint de prueba sin autenticación (para testing)
  @Post('test')
  async testChat(@Body() body: { message: string, userId: string }) {
    const response = await this.ragService.chatWithContext(
      body.message, 
      body.userId
    );
    
    return { 
      response,
      timestamp: new Date().toISOString()
    };
  }
}
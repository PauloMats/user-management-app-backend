import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Opcional: Configurações do Prisma Client, como logging
      // log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    // Conecta ao banco de dados quando o módulo é inicializado
    await this.$connect();
    console.log('Prisma Client conectado ao banco de dados.');
  }

  async onModuleDestroy() {
    // Desconecta do banco de dados quando a aplicação é encerrada
    await this.$disconnect();
    console.log('Prisma Client desconectado do banco de dados.');
  }
}
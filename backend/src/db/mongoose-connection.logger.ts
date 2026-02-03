// database/mongoose-connection.logger.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Injectable()
export class MongooseConnectionLogger implements OnModuleInit {
  private readonly logger = new Logger('MongoDB');

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    if (this.connection.readyState === ConnectionStates.connected) {
      this.logger.log('MongoDB connected successfully');
    }

    this.connection.on('connected', () => {
      this.logger.log('MongoDB connected');
    });

    this.connection.on('error', (err) => {
      this.logger.error('MongoDB connection error', err);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('MongoDB disconnected');
    });
  }
}

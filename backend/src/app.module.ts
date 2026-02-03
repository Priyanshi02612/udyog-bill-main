import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config, { AppConfig } from './config';
import { MongooseConnectionLogger } from './db/mongoose-connection.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        uri: configService.get<string>('database.connectionString', {
          infer: true,
        }),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, MongooseConnectionLogger],
})
export class AppModule {}

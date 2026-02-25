import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config, { AppConfig } from './config';
import { MongooseConnectionLogger } from './db/mongoose-connection.logger';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { InventoryModule } from './inventory/inventory.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { AiModule } from './ai/ai.module';

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
        dbName: 'udyog-bill',
      }),
    }),
    AuthModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const mailer = configService.get('mailer', { infer: true });

        return {
          transport: {
            host: mailer?.host,
            port: mailer?.port,
            secure: mailer?.secure,
            auth: {
              user: mailer?.auth.user,
              pass: mailer?.auth.pass,
            },
          },
          defaults: {
            from: `"Udyog Bill Team" <${mailer?.auth.user}>`,
          },
        };
      },
    }),
    UsersModule,
    ItemsModule,
    InventoryModule,
    ManufacturerModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService, MongooseConnectionLogger],
})
export class AppModule {}

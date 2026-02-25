import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from 'src/db/schema/item.schema';
import { User, UserSchema } from 'src/db/schema/user.schema';
import {
  UserBusinessDetails,
  UserBusinessDetailsSchema,
} from 'src/db/schema/user-business-details.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: User.name, schema: UserSchema },
      { name: UserBusinessDetails.name, schema: UserBusinessDetailsSchema },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

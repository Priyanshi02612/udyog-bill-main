import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/db/schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async getUserByFirebaseId(firebaseUid: string) {
    const user = await this.userModel.findOne({ firebaseUid });

    if (!user) throw Error('User not found!');

    return user;
  }
}

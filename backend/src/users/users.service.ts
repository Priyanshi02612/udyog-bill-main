import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../db/schema/user.schema';
import { UserBusinessDetails } from '../db/schema/user-business-details.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(UserBusinessDetails.name)
    private readonly userBusinessDetailsModel: Model<UserBusinessDetails>,
  ) {}

  async getUserByFirebaseId(firebaseUid: string) {
    const user = await this.userModel.findOne({ firebaseUid });

    if (!user) {
      throw new NotFoundException({ message: 'User not found!' });
    }

    const businessDetails = await this.userBusinessDetailsModel.findOne(
      {
        userId: user.id,
      },
      { versionKey: false, _id: false },
    );

    return {
      ...(user.toObject() as object),
      ...((businessDetails?.toObject() as object) || {}),
    };
  }
}

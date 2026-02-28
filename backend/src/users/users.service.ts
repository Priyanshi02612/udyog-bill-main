import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const existingUser = await this.userModel.findOne({ firebaseUid });

    if (!existingUser) {
      throw new NotFoundException({ message: 'User not found!' });
    }

    if (!existingUser.isActive) {
      throw new ForbiddenException(
        'Your account is deactivated. Please reactivate it to continue.',
      );
    }

    const businessDetails = await this.userBusinessDetailsModel.findOne(
      {
        userId: existingUser.id,
      },
      { versionKey: false, _id: false },
    );

    return {
      ...(existingUser.toObject() as object),
      ...((businessDetails?.toObject() as object) || {}),
    };
  }

  async deactivateUserByFirebaseId(firebaseUid: string) {
    const user = await this.userModel.findOneAndUpdate(
      { firebaseUid, isActive: true },
      { $set: { isActive: false } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException({ message: 'User not found!' });
    }

    return {
      firebaseUid: user.firebaseUid,
      isActive: user.isActive,
    };
  }

  async reactivateUserByFirebaseId(firebaseUid: string) {
    const user = await this.userModel.findOneAndUpdate(
      { firebaseUid, isActive: false },
      { $set: { isActive: true } },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException({ message: 'User not found!' });
    }

    return {
      firebaseUid: user.firebaseUid,
      isActive: user.isActive,
    };
  }
}

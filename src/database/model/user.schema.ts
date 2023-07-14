import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, id: false, toJSON: { virtuals: true } })
export class User {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;

    @Prop({ select: false })
    __v?: number;

    @Prop({ select: false })
    createdAt?: Date;

    @Prop({ select: false })
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.virtual('wallets', {
    ref: 'Wallet',
    localField: '_id',
    foreignField: 'user'
});
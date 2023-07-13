import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true})
export class User {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;
}

export const UserSchema = SchemaFactory.createForClass(User)
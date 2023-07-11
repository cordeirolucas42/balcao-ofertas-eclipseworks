import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true})
export class Wallet {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet)
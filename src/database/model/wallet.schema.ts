import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true, id: false, toJSON: { virtuals: true } })
export class Wallet {
    _id?: mongoose.Schema.Types.ObjectId

    @Prop()
    name: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet)

WalletSchema.virtual('assets', {
    ref: 'Asset',
    localField: '_id',
    foreignField: 'wallet'
});
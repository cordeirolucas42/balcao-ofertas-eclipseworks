import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Currency } from 'src/database/model/currency.schema';
import { User } from 'src/database/model/user.schema';
import { Wallet } from 'src/database/model/wallet.schema';

export type OfferDocument = HydratedDocument<Offer>;

@Schema({ timestamps: true})
export class Offer {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' })
    wallet: Wallet;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Currency' })
    currency: Currency;

    @Prop()
    amount: number;

    @Prop()
    unitPrice: number;

    @Prop({ default: true })
    listed: boolean;
}

export const OfferSchema = SchemaFactory.createForClass(Offer)
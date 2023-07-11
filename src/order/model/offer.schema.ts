import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer>;

@Schema()
export class Offer {
    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    // user: User;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' })
    // wallet: Wallet;

    // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Currency' })
    // currency: Currency;

    // @Prop()
    // amount: number;

    // @Prop()
    // listed: boolean;
}

export const OfferSchema = SchemaFactory.createForClass(Offer)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CurrencyDocument = HydratedDocument<Currency>;

@Schema({ timestamps: true})
export class Currency {
    @Prop()
    name: string;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency)
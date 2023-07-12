import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type CurrencyDocument = HydratedDocument<Currency>;

@Schema({ timestamps: true})
export class Currency {
    _id?: mongoose.Schema.Types.ObjectId

    @Prop()
    name: string;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency)
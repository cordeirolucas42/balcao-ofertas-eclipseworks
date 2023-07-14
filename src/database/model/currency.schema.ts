import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type CurrencyDocument = HydratedDocument<Currency>;

@Schema({ timestamps: true, id: false })
export class Currency {
    _id?: mongoose.Schema.Types.ObjectId

    @Prop()
    name: string;

    @Prop({ select: false })
    __v?: number;

    @Prop({ select: false })
    createdAt?: Date;

    @Prop({ select: false })
    updatedAt?: Date;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency)
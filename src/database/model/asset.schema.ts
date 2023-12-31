import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Currency } from './currency.schema';
import { Wallet } from './wallet.schema';

export type AssetDocument = HydratedDocument<Asset>;

@Schema({ timestamps: true, id: false })
export class Asset {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' })
  wallet: Wallet;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Currency' })
  currency: Currency;

  @Prop()
  amount: number;

  @Prop({ select: false })
  __v?: number;

  @Prop({ select: false })
  createdAt?: Date;

  @Prop({ select: false })
  updatedAt?: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

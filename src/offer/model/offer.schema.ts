import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Currency } from '../../database/model/currency.schema';
import { User } from '../../database/model/user.schema';
import { Wallet } from '../../database/model/wallet.schema';
import { endOfDay, startOfDay } from 'date-fns';
import { ApiProperty } from '@nestjs/swagger';

// query params
export const offersListed = {
    listed: true
}

export const offersCreatedBy = (userId: string) => ({
    user: userId
})

export const offersCreatedToday = {
    createdAt: {
        $gte: startOfDay(new Date()),
        $lte: endOfDay(new Date())
    }
}

export const recentOffersFirst = { createdAt: -1 as mongoose.SortOrder }

export const offerPropsToPopulate = ['user', 'wallet', 'currency']

// schema definition
export type OfferDocument = HydratedDocument<Offer>;

@Schema({ timestamps: true })
export class Offer {
    @ApiProperty({ type: String, example: '64add33781674cb2b11a7e22' })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @ApiProperty({ type: String, example: '64add33781674cb2b11a7e22' })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' })
    wallet: Wallet;

    @ApiProperty({ type: String, example: '64add33781674cb2b11a7e22' })
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Currency' })
    currency: Currency;

    @ApiProperty({ example: 3.5 })
    @Prop()
    amount: number;

    @ApiProperty({ example: 1234.56 })
    @Prop()
    unitPrice: number;

    @ApiProperty({ example: true })
    @Prop({ select: false, default: true })
    listed: boolean;

    @ApiProperty({ example: 0 })
    @Prop({ select: false })
    __v?: number;

    @ApiProperty({ example: new Date() })
    @Prop()
    createdAt?: Date;

    @ApiProperty({ example: new Date() })
    @Prop({ select: false })
    updatedAt?: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer)

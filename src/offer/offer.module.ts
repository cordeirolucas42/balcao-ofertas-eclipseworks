import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './model/offer.schema';
import { DatabaseModule } from '../database/database.module';
import { Asset, AssetSchema } from '../database/model/asset.schema';
import { Currency, CurrencySchema } from '../database/model/currency.schema';
import { Wallet, WalletSchema } from '../database/model/wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Currency.name, schema: CurrencySchema },
      { name: Asset.name, schema: AssetSchema }
    ]),
    DatabaseModule
  ],
  controllers: [OfferController],
  providers: [OfferService]
})
export class OfferModule {}

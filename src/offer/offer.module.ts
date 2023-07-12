import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './model/offer.schema';
import { DatabaseModule } from 'src/database/database.module';
import { User, UserSchema } from 'src/database/model/user.schema';
import { Asset, AssetSchema } from 'src/database/model/asset.schema';
import { Currency, CurrencySchema } from 'src/database/model/currency.schema';
import { Wallet, WalletSchema } from 'src/database/model/wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Offer.name, schema: OfferSchema },
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Currency.name, schema: CurrencySchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
    DatabaseModule
  ],
  controllers: [OfferController],
  providers: [OfferService]
})
export class OfferModule {}

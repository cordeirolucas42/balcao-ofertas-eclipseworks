import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database.service';
import { Currency, CurrencySchema } from './model/currency.schema';
import { User, UserSchema } from './model/user.schema';
import { Wallet, WalletSchema } from './model/wallet.schema';
import { Asset, AssetSchema } from './model/asset.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Wallet.name, schema: WalletSchema },
        { name: Currency.name, schema: CurrencySchema },
        { name: Asset.name, schema: AssetSchema },
    ])
  ],
  providers: [DatabaseService]
})
export class DatabaseModule {}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency } from './model/currency.schema';
import { User } from './model/user.schema';
import { Wallet } from './model/wallet.schema';
import { Asset } from './model/asset.schema';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
    @InjectModel(Asset.name) private assetModel: Model<Asset>
  ) {}
  
  async onModuleInit() {
    // seed DB
    if (process.env.DB_SEED !== "1") {
      return
    }

    await this.seedDB()

    // TEST
    // const testUser = await this.userModel.findOne({ name: "Bertha Shepherd"}).exec()
    // const testWallet = await this.walletModel.findOne({ user: testUser._id }).exec()
    // // const testAssets = await this.assetModel.find({ wallet: { $in: testWallets.map(({ _id }) => (_id)) } }).exec()
    // const testAssets = await this.assetModel.find({ wallet: testWallet._id }).populate([
    //   { path: 'wallet', populate: 'user'},
    //   { path: 'currency' },
    // ]).exec()
    // console.log(testAssets)
  }

  private async seedDB() {
    // if needed to clear db
    await this.userModel.deleteMany({}).exec()
    await this.walletModel.deleteMany({}).exec()
    await this.currencyModel.deleteMany({}).exec()
    await this.assetModel.deleteMany({}).exec()

    // CREATE CURRENCIES
    const currenciesSeed = [
      { name: "Bitcoin" },
      { name: "Dogecoin" },
      { name: "Ethereum" },
      { name: "Avalanche" },
      { name: "Zcash" },
    ]

    // SEED CURRENCY
    await this.currencyModel.insertMany(currenciesSeed)

    const currencyIds = await this.currencyModel.find({}).select('_id');

    // CREATE USERS
    const usersSeed = [
      {
        name: "Bertha Shepherd",
        wallets: []
      },
      {
        name: "Rufus Shaffer",
        wallets: []
      }
    ]

    // SEED USERS
    await this.userModel.insertMany(usersSeed)

    const userIds = await this.userModel.find({}).select('_id');

    // CREATE WALLETS
    const walletsSeed: Wallet[] = [
      { user: userIds[0] },
      { user: userIds[0] },
      { user: userIds[0] },
      { user: userIds[1] },
      { user: userIds[1] }
    ]

    // SEED WALLETS
    await this.walletModel.insertMany(walletsSeed)

    const walletIds = await this.walletModel.find({}).select('_id');

    // CREATE ASSETS
    const assetsSeed: Asset[] = [
      { wallet: walletIds[0], currency: currencyIds[0], amount: 15 },
      { wallet: walletIds[0], currency: currencyIds[1], amount: 3.5 },
      { wallet: walletIds[0], currency: currencyIds[2], amount: 0.3 },
      { wallet: walletIds[1], currency: currencyIds[3], amount: 15 },
      { wallet: walletIds[1], currency: currencyIds[4], amount: 3.5 },
      { wallet: walletIds[2], currency: currencyIds[2], amount: 0.3 },
      { wallet: walletIds[3], currency: currencyIds[3], amount: 15 },
      { wallet: walletIds[3], currency: currencyIds[1], amount: 3.5 },
      { wallet: walletIds[3], currency: currencyIds[2], amount: 0.3 },
      { wallet: walletIds[3], currency: currencyIds[4], amount: 0.3 },
      { wallet: walletIds[4], currency: currencyIds[3], amount: 15 }
    ]

    // SEED ASSETS
    await this.assetModel.insertMany(assetsSeed)

    console.log("seed db");
  }
}

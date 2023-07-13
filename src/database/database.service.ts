import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency } from './model/currency.schema';
import { User } from './model/user.schema';
import { Wallet } from './model/wallet.schema';
import { Asset } from './model/asset.schema';
import { Offer } from 'src/offer/model/offer.schema';
import * as fs from 'fs/promises';
import { UserInfo } from 'src/offer/model/offer.dto';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
  ) {}
  
  async onModuleInit() {
    if (process.env.DB_SEED !== '1') {
      return
    }

    // seed DB
    await this.seedDB()
  }

  private async seedDB() {
    await this.userModel.deleteMany({}).exec()
    await this.walletModel.deleteMany({}).exec()
    await this.currencyModel.deleteMany({}).exec()
    await this.assetModel.deleteMany({}).exec()
    await this.offerModel.deleteMany({}).exec()

    // CREATE CURRENCIES
    const currenciesSeed = [
      { name: 'Bitcoin' },
      { name: 'Dogecoin' },
      { name: 'Ethereum' },
      { name: 'Avalanche' },
      { name: 'Zcash' },
    ]

    // SEED CURRENCY
    const currencies = await this.currencyModel.insertMany(currenciesSeed)

    // CREATE USERS
    const usersSeed = [
      {
        name: 'Bertha Shepherd'
      },
      {
        name: 'Rufus Shaffer'
      },
      {
        name: 'Simon Jackson'
      }
    ]

    // SEED USERS
    const users = await this.userModel.insertMany(usersSeed)

    // CREATE WALLETS
    const walletsSeed: Wallet[] = [
      { user: users[0] },
      { user: users[0] },
      { user: users[2] },
      { user: users[1] },
      { user: users[1] }
    ]

    // SEED WALLETS
    const wallets = await this.walletModel.insertMany(walletsSeed)

    // CREATE ASSETS
    const assetsSeed: Asset[] = [
      { wallet: wallets[0], currency: currencies[0], amount: 15 },
      { wallet: wallets[0], currency: currencies[1], amount: 3.5 },
      { wallet: wallets[0], currency: currencies[2], amount: 0.3 },
      { wallet: wallets[1], currency: currencies[3], amount: 15 },
      { wallet: wallets[1], currency: currencies[4], amount: 3.5 },
      { wallet: wallets[2], currency: currencies[2], amount: 0.3 },
      { wallet: wallets[3], currency: currencies[3], amount: 15 },
      { wallet: wallets[3], currency: currencies[1], amount: 3.5 },
      { wallet: wallets[3], currency: currencies[2], amount: 0.3 },
      { wallet: wallets[3], currency: currencies[4], amount: 0.3 },
      { wallet: wallets[4], currency: currencies[3], amount: 15 }
    ]

    // SEED ASSETS
    const assets = await this.assetModel.insertMany(assetsSeed)

    // CREATE OFFERS
    const offersSeed: Offer[] = [
      { user: users[0], wallet: wallets[0], currency: currencies[0], amount: 1, unitPrice: 1234.56, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[1], amount: 0.15, unitPrice: 16197.56, listed: true },
      { user: users[1], wallet: wallets[4], currency: currencies[3], amount: 10, unitPrice: 37833.24, listed: true },
      { user: users[1], wallet: wallets[4], currency: currencies[3], amount: 0.5, unitPrice: 27827.25, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[1], amount: 1, unitPrice: 728278.42, listed: true },
      { user: users[1], wallet: wallets[4], currency: currencies[3], amount: 0.5, unitPrice: 2787822.1, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[0], amount: 3, unitPrice: 75575.17, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[0], amount: 0.5, unitPrice: 57575.47, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[0], amount: 0.3, unitPrice: 757223.23, listed: true },
      { user: users[2], wallet: wallets[2], currency: currencies[2], amount: 0.15, unitPrice: 34534.4747, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[1], amount: 0.01, unitPrice: 34557.24, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[2], amount: 0.1, unitPrice: 5757.67, listed: true },
      { user: users[0], wallet: wallets[1], currency: currencies[3], amount: 5, unitPrice: 14141.76, listed: true },
      { user: users[0], wallet: wallets[1], currency: currencies[4], amount: 1, unitPrice: 424242.75, listed: true },
      { user: users[0], wallet: wallets[1], currency: currencies[4], amount: 0.2, unitPrice: 74447.74, listed: true },
      { user: users[2], wallet: wallets[2], currency: currencies[2], amount: 0.01, unitPrice: 11441.74, listed: true },
      { user: users[0], wallet: wallets[0], currency: currencies[0], amount: 2, unitPrice: 55445.75, listed: true },
    ]

    // SEED OFFERS
    await this.offerModel.insertMany(offersSeed)

    // Log database into 'seedInfo.json' file    
    const data = await this.getAllData()
    const stringifiedData = JSON.stringify(
      data,
      undefined,
      2
    )
    await fs.writeFile('src/database/seedInfo.json', stringifiedData)

    console.log('seed db');
  }
  
  private async getAllData() {
    const allAssets = await this.assetModel
      .find({})
      .populate([{ path: 'wallet', populate: 'user' }, 'currency'])
      .exec()

    const allUsers: UserInfo[] = []
    allAssets.forEach((asset) => {
      const assetInfo = {
        _id: asset._id.toString(),
        currency: {
          _id: asset.currency._id.toString(),
          name: asset.currency.name,
        },
        amount: asset.amount
      }

      const userIds = allUsers.map(({ _id }) => _id.toString())
      if (!userIds.includes(asset.wallet.user._id.toString())) {
        allUsers.push({
          _id: asset.wallet.user._id.toString(),
          name: asset.wallet.user.name,
          wallets: [{
            _id: asset.wallet._id.toString(),
            assets: [assetInfo]
          }]
        })

        return
      }

      const userInfo = allUsers.find(
        user => user._id === asset.wallet.user._id.toString()
      )
      const walletIds = userInfo.wallets.map(({ _id }) => _id)
      if (!walletIds.includes(asset.wallet._id.toString())) {
        userInfo.wallets.push({
          _id: asset.wallet._id.toString(),
          assets: [assetInfo]
        })

        return
      }

      const walletInfo = userInfo.wallets.find(
        wallet => wallet._id === asset.wallet._id.toString()
      )
      walletInfo.assets.push(assetInfo)
    })

    return { users: allUsers }
  }
}

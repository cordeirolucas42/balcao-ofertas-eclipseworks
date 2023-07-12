import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateOfferDTO, ListOffersParams, OfferId, UserInfo } from './model/offer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Offer, OfferDocument } from './model/offer.schema';
import { Asset } from 'src/database/model/asset.schema';
import { endOfDay, startOfDay } from 'date-fns';
import { Paginated, Pagination } from 'src/common/pagination';
import { Wallet } from 'src/database/model/wallet.schema';
import { User } from 'src/database/model/user.schema';

const MAX_OFFERS_PER_DAY = 5
const ITEMS_PER_PAGE = 2

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>
  ) {}

  // FOR TESTS
  public async getAllInfo() {
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

    return allUsers
  }

  public async listOffers(
    userId: string, listOffersParams: ListOffersParams
  ): Promise<Paginated<Offer>> {
    const { paginated, page = 1, limit = ITEMS_PER_PAGE } = listOffersParams

    // scroll
    if (!paginated) {
      const offers = await this.getAllListedOffers()
      return offers
    }

    // paginated
    const paginatedOffers = await this.getPaginatedListedOffers(
      page,
      limit
    )
    return paginatedOffers
  }

  public async createOffer(
    userId: string, createOfferDTO: CreateOfferDTO
  ): Promise<OfferId> {
    // conferir se é o usuário certo
    await this.checkIfUserOwnsWallet(userId, createOfferDTO.walletId);

    // precisa ter saldo suficiente de uma currency em uma wallet
    // @TODO: subtrair ofertas listadas do saldo
    await this.checkEnoughBalance(createOfferDTO)

    // máximo de 5 ofertas por dia
    await this.checkMaxOffersPerDay(userId)

    return this.createOfferFromDTO(userId, createOfferDTO)
  }

  public async unlistOffer(
    userId: string, offerId: string
  ): Promise<void> {
    this.checkIfValidId(offerId)
    const offerToUnlist = await this.getOfferById(offerId)

    // somente criador da oferta pode unlist
    const offerUserId = offerToUnlist.user._id.toString()
    this.checkIfUserOwnsOffer(userId, offerUserId);

    // soft-delete, não remove do BD
    await this.softDeleteOffer(offerToUnlist)
  }

  private async getAllListedOffers() {
    const offers = await this.generateListedOffersQuery().exec()
    return { data: offers }
  }

  private async getPaginatedListedOffers(page: number, limit: number) {
    const totalListedOffers = await this.countListedOffers()

    const pagination = new Pagination(page, limit, totalListedOffers)

    const offers = await this.generateListedOffersQuery()
      .skip(pagination.skip)
      .limit(limit)
      .exec()

    return {
      data: offers,
      currentPage: page,
      lastPage: pagination.lastPage
    }
  }

  private async countListedOffers() {
    return this.offerModel.countDocuments({ listed: true }).exec()
  }

  private generateListedOffersQuery() {
    const propsToExclude = ['-__v', '-createdAt', '-updatedAt']

    // ordem decrescente de criação
    return this.offerModel
      .find({ listed: true })
      .select(['-__v', '-listed', '-updatedAt'])
      .populate([
        { path: 'user', select: propsToExclude},
        { path: 'currency', select: propsToExclude}
      ])
      .sort({ createdAt: -1 })
  }

  private async checkIfUserOwnsWallet(
    userId: string, offerWalletId: string
  ) {
    const walletOwner = await this.getWalletOwner(offerWalletId)
    if (walletOwner._id.toString() !== userId) {
      throw new UnauthorizedException('User does not own wallet');
    }
  }

  private async getWalletOwner(walletId: string): Promise<User> {
    const wallet = await this.walletModel
      .findById(walletId)
      .populate('user')
      .exec()

    return wallet.user
  }

  private async createOfferFromDTO(userId: string, createOfferDTO: CreateOfferDTO) {
    const { walletId, currencyId, amount, unitPrice } = createOfferDTO

    // const offerToCreate = this.offerAdaptor(userId, createOfferDTO)
    // const createdOffer = new this.offerModel(offerToCreate)
    const createdOffer = new this.offerModel({
      user: userId,
      wallet: walletId,
      currency: currencyId,
      amount,
      unitPrice
    })
    createdOffer.save()
    return { _id: createdOffer._id.toString() }
  }

  private async checkEnoughBalance(createOfferDTO: CreateOfferDTO) {
    const { walletId, currencyId, amount } = createOfferDTO

    const asset = await this.assetModel
      .findOne({ wallet: walletId, currency: currencyId })
      .exec()

    if (amount > asset.amount) {
      throw new BadRequestException('Not enough balance')
    }
  }

  private async checkMaxOffersPerDay(userId: string) {
    const offersToday = await this.offerModel
      .countDocuments({
        user: userId,
        listed: true,
        // createdAt:  {
        //   $gte: startOfDay(new Date()),
        //   $lte: endOfDay(new Date())
        // }
      })
      .exec()

    if (offersToday >= MAX_OFFERS_PER_DAY) {
      throw new BadRequestException('Maximum amount of offers created per day reached')
    }
  }

  private offerAdaptor(userId: string, createOfferDTO: CreateOfferDTO) {
    const { walletId, currencyId, amount, unitPrice } = createOfferDTO

    return {
      user: userId,
      wallet: walletId,
      currency: currencyId,
      amount,
      unitPrice
    }
  }

  private async getOfferById(offerId: string) {

    const offer = await this.offerModel
      .findById(offerId)
      .populate(['user', 'wallet'])
      .exec()
    
    if (!offer) {
      throw new BadRequestException('There is no offer with this Id');
    }
    
    return offer
  }

  private checkIfValidId(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(id + ' is not a valid id');
    }
  }

  private checkIfUserOwnsOffer(
    userId: string, offerUserId: string
  ) {
    if (offerUserId !== userId) {
      throw new UnauthorizedException('User does not own offer');
    }
  }

  private async softDeleteOffer(offer: OfferDocument) {
    offer.listed = false
    await offer.save()
  }
}
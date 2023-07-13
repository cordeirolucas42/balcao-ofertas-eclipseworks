import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateOfferDTO, ListOffersParams, OfferId } from './model/offer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferDocument } from './model/offer.schema';
import { Asset } from 'src/database/model/asset.schema';
import { endOfDay, startOfDay } from 'date-fns';
import { Paginated, Pagination } from 'src/common/pagination';
import { Wallet } from 'src/database/model/wallet.schema';
import { User } from 'src/database/model/user.schema';
import { Currency } from 'src/database/model/currency.schema';

const MAX_OFFERS_PER_DAY = 5
const ITEMS_PER_PAGE = 2

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
  ) {}

  public async listOffers(
    userId: string, listOffersParams: ListOffersParams
  ): Promise<Paginated<Offer>> {
    // not constrained by userId
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
    // conferir se os ids correspondem a documentos
    await this.checkIdsInCreateOfferDTO(createOfferDTO)

    // conferir se é o usuário certo
    await this.checkIfUserOwnsWallet(userId, createOfferDTO.walletId)

    // precisa ter saldo suficiente de uma moeda em uma carteira, levando em conta as ofertas listadas
    await this.checkEnoughBalance(createOfferDTO)

    // máximo de 5 ofertas por dia por usuário
    await this.checkMaxOffersPerDay(userId)

    return this.createOfferFromDTO(userId, createOfferDTO)
  }

  public async unlistOffer(
    userId: string, offerId: string
  ): Promise<void> {
    const offerToUnlist = await this.getOfferById(offerId)

    // somente criador da oferta pode soft-delete
    const offerUserId = offerToUnlist.user._id.toString()
    this.checkIfUserOwnsOffer(userId, offerUserId);

    // soft-delete, não remove do BD
    await this.softDeleteOffer(offerToUnlist)
  }

  private async checkIdsInCreateOfferDTO(createOfferDTO: CreateOfferDTO) {
    const { walletId, currencyId } = createOfferDTO

    await this.checkExistingId(this.walletModel, walletId)
    await this.checkExistingId(this.currencyModel, currencyId)
  }

  private async checkExistingId<T>(model: Model<T>, id: string) {
    const document = await model.findById(id).exec()
    if (!document) {
      throw new BadRequestException(`Id ${id} does not correspond to any document`)
    }
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
    // exibe apenas ofertas criadas hoje
    return this.offerModel
      .find({
        listed: true,
        createdAt: {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      })
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
    await this.checkExistingId(this.userModel, userId)

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

    if (!asset) {
      throw new BadRequestException('Not enough balance')
    }

    const totalOffered = await this.getTotalOfferedByAsset(walletId, currencyId)

    if (amount > (asset.amount - totalOffered)) {
      throw new BadRequestException('Not enough balance')
    }
  }

  private async getTotalOfferedByAsset(walletId: string, currencyId: string) {
    const offers = await this.offerModel
      .find({ wallet: walletId, currency: currencyId })
      .exec()

    const offerTotal = offers.reduce((sum, offer) => {
      return sum + offer.amount
    }, 0)

    return offerTotal
  }

  private async checkMaxOffersPerDay(userId: string) {
    const offersToday = await this.offerModel
      .countDocuments({
        user: userId,
        listed: true,
        createdAt:  {
          $gte: startOfDay(new Date()),
          $lte: endOfDay(new Date())
        }
      })
      .exec()

    if (offersToday >= MAX_OFFERS_PER_DAY) {
      throw new BadRequestException('Maximum amount of offers created per day reached')
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
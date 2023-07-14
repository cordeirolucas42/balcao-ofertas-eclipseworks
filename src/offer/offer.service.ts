import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateOfferDTO, ListOffersParams } from './model/offer.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferDocument, offersCreatedBy, offersCreatedToday, offersListed, offerPropsToPopulate, recentOffersFirst } from './model/offer.schema';
import { Asset } from '../database/model/asset.schema';
import { Paginated, Pagination } from '../common/pagination';
import { Wallet } from '../database/model/wallet.schema';
import { Currency } from '../database/model/currency.schema';

export const MAX_OFFERS_PER_DAY = 5
const ITEMS_PER_PAGE = 10

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
    @InjectModel(Asset.name) private assetModel: Model<Asset>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Currency.name) private currencyModel: Model<Currency>
  ) {}

  public async listOffers(
    userId: string, listOffersParams: ListOffersParams
  ): Promise<Paginated<Offer>> {
    // não depende de userId, mas disponível para futuro
    const { paginated, page = 1, limit = ITEMS_PER_PAGE } = listOffersParams

    // scroll
    if (!paginated) {
      const offers = await this.getAllListedOffers()
      return offers
    }

    // paginação
    const paginatedOffers = await this.getPaginatedListedOffers(
      page,
      limit
    )
    return paginatedOffers
  }

  public async createOffer(
    userId: string, createOfferDTO: CreateOfferDTO
  ): Promise<Offer> {
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
    // offerId precisa corresponder a uma oferta
    const offerToUnlist = await this.getOfferById(offerId)

    // somente criador da oferta pode soft-delete
    this.checkIfUserOwnsOffer(userId, offerToUnlist)

    // soft-delete, não remove do BD
    await this.softDeleteOffer(offerToUnlist)
  }

  private async getAllListedOffers() {
    const offers = await this.getListedOffersTodayQuery().exec()
    return { data: offers }
  }

  private getListedOffersTodayQuery() {
    // ordem decrescente de criação
    // exibe apenas ofertas criadas hoje
    return this.offerModel
      .find({
        ...offersListed,
        ...offersCreatedToday
      })
      .populate(offerPropsToPopulate)
      .sort(recentOffersFirst)
  }

  private async getPaginatedListedOffers(page: number, limit: number) {
    const totalListedOffers = await this.countListedOffers()

    const pagination = new Pagination(page, limit, totalListedOffers)

    const offers = await this.getListedOffersTodayQuery()
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
    return this.offerModel.countDocuments({
      ...offersListed,
      ...offersCreatedToday
    }).exec()
  }

  private async checkIdsInCreateOfferDTO(createOfferDTO: CreateOfferDTO) {
    const { walletId, currencyId } = createOfferDTO

    await this.checkExistingId(this.walletModel, walletId)
    await this.checkExistingId(this.currencyModel, currencyId)
  }

  private async checkExistingId<T>(model: Model<T>, id: string) {
    const document = await model.findById(id).exec()
    if (!document) {
      throw new NotFoundException(`There is no document with Id ${id}`)
    }
  }

  private async checkIfUserOwnsWallet(
    userId: string, offerWalletId: string
  ) {
    const ownerId = await this.getWalletOwnerId(offerWalletId)
    if (ownerId !== userId) {
      throw new UnauthorizedException('User does not own wallet');
    }
  }

  private async getWalletOwnerId(walletId: string): Promise<string> {
    const wallet = await this.walletModel
      .findById(walletId)
      .exec()

    return wallet.user.toString()
  }

  private async checkEnoughBalance(createOfferDTO: CreateOfferDTO) {
    const { walletId, currencyId, amount } = createOfferDTO

    const asset = await this.getAssetIfExists(walletId, currencyId)

    const totalOffered = await this.getTotalOfferedByAsset(walletId, currencyId)

    if (this.isOfferAmountMoreThanOwned(amount, asset, totalOffered)) {
      throw new ForbiddenException('Not enough balance')
    }
  }

  private async getAssetIfExists(walletId: string, currencyId: string) {
    const asset = await this.assetModel
      .findOne({ wallet: walletId, currency: currencyId })
      .exec()

    if (!asset) {
      throw new ForbiddenException('Not enough balance')
    }

    return asset
  }

  private async getTotalOfferedByAsset(walletId: string, currencyId: string) {
    const offers = await this.offerModel
      .find({ wallet: walletId, currency: currencyId })
      .exec()

    return this.sumOfferAmounts(offers)
  }

  private sumOfferAmounts(offers: Offer[]) {
    return offers.reduce((sum, offer) => {
      return sum + offer.amount
    }, 0)
  }

  private isOfferAmountMoreThanOwned(offerAmount: number, asset: Asset, totalOffered: number) {
    const ownedAmount = asset.amount - totalOffered
    return offerAmount > ownedAmount
  }

  private async checkMaxOffersPerDay(userId: string) {
    const offersToday = await this.offerModel
      .countDocuments({
        ...offersCreatedBy(userId),
        ...offersListed,
        ...offersCreatedToday
      })
      .exec()

    if (offersToday >= MAX_OFFERS_PER_DAY) {
      throw new ForbiddenException('Maximum amount of offers created per day reached')
    }
  }

  private async createOfferFromDTO(userId: string, createOfferDTO: CreateOfferDTO) {
    const { walletId, currencyId, amount, unitPrice } = createOfferDTO
    const createdOffer = await this.offerModel.create({
      user: userId,
      wallet: walletId,
      currency: currencyId,
      amount,
      unitPrice
    })

    createdOffer.save()
    return createdOffer
  }

  private async getOfferById(offerId: string) {
    const offer = await this.offerModel
      .findById(offerId)
      .exec()
    
    if (!offer) {
      throw new NotFoundException(`There is no offer with Id ${offerId}`);
    }
    
    return offer
  }

  private checkIfUserOwnsOffer(
    userId: string, offer: Offer
  ) {
    const offerUserId = offer.user.toString()
    if (offerUserId !== userId) {
      throw new UnauthorizedException('User does not own offer');
    }
  }

  private async softDeleteOffer(offer: OfferDocument) {
    offer.listed = false
    await offer.save()
  }
}
import { Injectable } from "@nestjs/common";
import { CreateOfferDTO, ListOffersParams, UnlistOfferParams } from "./model/offer.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Offer } from "./model/offer.schema";

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>
  ) {}

  public async listOffers(listOffersParams: ListOffersParams): Promise<Offer[]> {
    // paginação ou scroll
    // ordem decrescente de criação OK
    const { userId, paginated } = listOffersParams
    const offers = await this.offerModel
      .find({ listed: true })
      .populate(['user', 'currency'])
      .sort({ createdAt: -1 })
      .exec()
    return offers;
  }

  public async createOffer(createOfferDTO: CreateOfferDTO): Promise<Offer> {
    // conferir se é o usuário certo
    // precisa ter saldo suficiente de uma currency em uma wallet
    // máximo de 5 ofertas por dia
    const createdOffer = new this.offerModel(createOfferDTO)
    return createdOffer.save()
  }

  public async unlistOffer(unlistOfferParams: UnlistOfferParams): Promise<void> {
    // somente criador da oferta pode unlist OK
    // soft-delete, não remove do bd OK
    const { userId, offerId } = unlistOfferParams
    const offerToUnlist = await this.offerModel
      .findById(offerId)
      .populate('user')
      .exec()

    if (offerToUnlist.user._id.toString() !== userId) {
      // Raise error
      return
    }

    offerToUnlist.listed = false
    await offerToUnlist.save()
  }
}
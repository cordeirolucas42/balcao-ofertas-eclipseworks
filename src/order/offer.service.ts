import { Injectable } from "@nestjs/common";
import { CreateOfferDTO, ListOffersParams, UnlistOfferParams } from "./model/offer.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Offer } from "./model/offer.schema";

@Injectable()
export class OfferService {
  constructor(
    @InjectModel(Offer.name) private orderModel: Model<Offer>
  ) {}

  public async listOffers(listOffersParams: ListOffersParams): Promise<Offer[]> {
    // paginação ou scroll
    // ordem decrescente de criação
    return {} as Offer[];
  }

  public async createOffer(createOfferDTO: CreateOfferDTO): Promise<Offer> {
    // precisa ter saldo suficiente de uma currency em uma wallet
    // máximo de 5 ofertas por dia
    return {} as Offer;
  }

  public async unlistOffer(unlistOfferParams: UnlistOfferParams): Promise<void> {
    // somente criador da oferta pode unlist
    // soft-delete, não remove do bd
  }
}
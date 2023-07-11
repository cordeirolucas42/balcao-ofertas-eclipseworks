import { Body, Controller, Get, Param, Post, Delete, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OfferService } from './offer.service';
import { CreateOfferDTO, ListOffersParams, UnlistOfferParams } from './model/offer.dto';
import { Offer } from './model/offer.schema';

@Controller('offer')
@ApiTags('Offer')
export class OfferController {
  constructor(
    private readonly orderService: OfferService
  ) {}

  @Get()
  @ApiResponse({ isArray: true, type: Offer })
  async listOffers(
    // precisa enviar o id de usuário na query/body
    @Query() listOffersParams: ListOffersParams
  ): Promise<Offer[]> {
    return this.orderService.listOffers(listOffersParams)
  }

  @Post()
  async createOffer(
    // precisa enviar o id de usuário na query/body
    @Body() createOfferDTO: CreateOfferDTO
  ): Promise<Offer> {
    return this.orderService.createOffer(createOfferDTO)
  }

  @Delete()
  async unlistOffer(
    // precisa enviar o id de usuário na query/body
    @Query() unlistOfferParams: UnlistOfferParams
  ): Promise<void> {
    return this.orderService.unlistOffer(unlistOfferParams)
  }
}
import { Body, Controller, Get, Param, Post, Delete, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OfferService } from './offer.service';
import { CreateOfferDTO, ListOffersParams, OfferId, UnlistOfferParam, UserIdParam, UserInfo } from './model/offer.dto';
import { Offer } from './model/offer.schema';
import { Paginated } from 'src/common/pagination';

@Controller('offer')
@ApiTags('Offer')
export class OfferController {
  constructor(
    private readonly offerService: OfferService
  ) {}

  // FOR TESTS
  @Get('test-all-info')
  @ApiResponse({ isArray: true, type: UserInfo })
  async getAllInfo(): Promise<UserInfo[]> {
    return this.offerService.getAllInfo()
  }

  @Get()
  @ApiResponse({ isArray: true, type: Offer })
  async listOffers(
    @Query() { userId }: UserIdParam,
    @Query() listOffersParams: ListOffersParams
  ): Promise<Paginated<Offer>> {
    return this.offerService.listOffers(userId, listOffersParams)
  }

  @Post()
  @ApiResponse({ type: OfferId })
  async createOffer(
    @Query() { userId }: UserIdParam,
    @Body() createOfferDTO: CreateOfferDTO
  ): Promise<OfferId> {
    return this.offerService.createOffer(userId, createOfferDTO)
  }

  @Delete(':offerId')
  async unlistOffer(
    @Param() { offerId }: UnlistOfferParam,
    @Query() { userId }: UserIdParam
  ): Promise<void> {
    return this.offerService.unlistOffer(userId, offerId)
  }
}
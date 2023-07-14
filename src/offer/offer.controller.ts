import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Query
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { OfferService } from './offer.service';
import {
  CreateOfferDTO,
  ListOffersParams,
  OfferDTO,
  UnlistOfferParam,
  UserIdParam
} from './model/offer.dto';
import { Offer } from './model/offer.schema';
import { Paginated } from '../common/pagination';

@Controller('offer')
@ApiTags('Offer')
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get()
  @ApiOkResponse({ isArray: true, type: OfferDTO })
  @ApiBadRequestResponse({ description: 'Incorrect parameter types' })
  async listOffers(
    @Query() { userId }: UserIdParam,
    @Query() listOffersParams: ListOffersParams
  ): Promise<Paginated<Offer>> {
    return this.offerService.listOffers(userId, listOffersParams);
  }

  @Post()
  @ApiOkResponse({ type: Offer })
  @ApiBadRequestResponse({ description: 'Incorrect parameter or body types' })
  @ApiNotFoundResponse({ description: 'There is no document with Id' })
  @ApiUnauthorizedResponse({ description: 'User does not own wallet' })
  @ApiForbiddenResponse({
    description: 'Maximum amount of offers created per day reached'
  })
  @ApiForbiddenResponse({ description: 'Not enough balance' })
  async createOffer(
    @Query() { userId }: UserIdParam,
    @Body() createOfferDTO: CreateOfferDTO
  ): Promise<Offer> {
    return this.offerService.createOffer(userId, createOfferDTO);
  }

  @Delete(':offerId')
  @ApiOkResponse({ description: 'Offer removed successfully' })
  @ApiBadRequestResponse({ description: 'Incorrect parameter types' })
  @ApiNotFoundResponse({ description: 'There is no offer with Id' })
  @ApiUnauthorizedResponse({ description: 'User does not own offer' })
  async unlistOffer(
    @Query() { userId }: UserIdParam,
    @Param() { offerId }: UnlistOfferParam
  ): Promise<void> {
    return this.offerService.unlistOffer(userId, offerId);
  }
}

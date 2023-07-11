import { Module } from '@nestjs/common';
import { OfferController } from './offer.controller';
import { OfferService } from './offer.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './model/offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }])
  ],
  controllers: [OfferController],
  providers: [OfferService]
})
export class OfferModule {}

import { OfferController } from "../offer.controller";
import { OfferService } from "../offer.service";
import { offerMocks } from "./offer.mock";

describe("OfferController", () => {
    const offerControler = new OfferController(offerMocks.offerService as any as OfferService)

    describe("listOffers", () => {
        it("Should pass the correct params to the correct service", async () => {
            await offerControler.listOffers(
                offerMocks.userIdParams,
                offerMocks.listOfferPaginatedParams
            )
            expect(offerMocks.offerService.listOffers).toBeCalledWith(
                offerMocks.userIdParams.userId,
                offerMocks.listOfferPaginatedParams
            )
        });
    });

    describe("createOffer", () => {
        it("Should pass the correct params to the correct service", async () => {
            await offerControler.createOffer(
                offerMocks.userIdParams,
                offerMocks.createOfferDTO
            )
            expect(offerMocks.offerService.createOffer).toBeCalledWith(
                offerMocks.userIdParams.userId,
                offerMocks.createOfferDTO
            )
        });      
    });

    describe("unlistOffer", () => {
        it("Should pass the correct params to the correct service", async () => {
            await offerControler.unlistOffer(
                offerMocks.userIdParams,
                offerMocks.unlistOfferParams
            )
            expect(offerMocks.offerService.unlistOffer).toBeCalledWith(
                offerMocks.userIdParams.userId,
                offerMocks.unlistOfferParams.offerId
            )
        });   
    });
});
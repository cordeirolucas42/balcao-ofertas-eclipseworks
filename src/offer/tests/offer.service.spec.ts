import { Model } from "mongoose";
import { Offer, offersCreatedToday, offersListed, offerPropsToPopulate, recentOffersFirst, offersCreatedBy } from "../model/offer.schema";
import { Asset } from "src/database/model/asset.schema";
import { Currency } from "src/database/model/currency.schema";
import { Wallet } from "src/database/model/wallet.schema";
import { OfferService } from "../offer.service";
import { offerMocks } from "./offer.mock";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { User } from "src/database/model/user.schema";

describe("OfferService", () => {
    const offerService  = new OfferService(
        offerMocks.offerModel as any as Model<Offer>,
        offerMocks.assetModel as any as Model<Asset>,
        offerMocks.walletModel as any as Model<Wallet>,
        offerMocks.currencyModel as any as Model<Currency>
    )

    describe("listOffers", () => {
        test("Listagem por paginação", async () => {
            offerMocks.offerModel.exec = offerMocks.listPaginatedOffersExec

            const res = await offerService.listOffers(
                offerMocks.userId,
                offerMocks.listOfferPaginatedParams
            )

            expect(offerMocks.offerModel.countDocuments).toBeCalledWith({
                ...offersListed,
                ...offersCreatedToday
            });
            expect(offerMocks.offerModel.find).toBeCalledWith({
                ...offersListed,
                ...offersCreatedToday
            });
            expect(offerMocks.offerModel.populate).toBeCalledWith(offerPropsToPopulate);
            expect(offerMocks.offerModel.sort).toBeCalledWith(recentOffersFirst);
            expect(offerMocks.offerModel.skip).toBeCalledWith(0);
            expect(offerMocks.offerModel.limit).toBeCalledWith(10);
            expect(res).toStrictEqual({ data: [], currentPage: 1, lastPage: 3 });
        });
        test("Listagem por scroll", async () => {
            offerMocks.offerModel.exec = offerMocks.listScrollOffersExec

            const res = await offerService.listOffers(
                offerMocks.userId,
                offerMocks.listOfferScrollParams
            )
            expect(offerMocks.offerModel.find).toBeCalledWith({
                ...offersListed,
                ...offersCreatedToday
            });
            expect(offerMocks.offerModel.populate).toBeCalledWith(offerPropsToPopulate);
            expect(offerMocks.offerModel.sort).toBeCalledWith(recentOffersFirst);
            expect(res).toStrictEqual({ data: [] });
        });
    });
    describe("createOffer", () => {
        test("Criar oferta corretamente", async () => {
            offerMocks.createOfferCorrectlyModelMocks()

            const res = await offerService.createOffer(
                offerMocks.userId,
                offerMocks.createOfferDTO
            )

            expect(res).toStrictEqual(offerMocks.createdOffer);

            // checkIdsInCreateOfferDTO
            expect(offerMocks.walletModel.findById).toBeCalledWith(offerMocks.walletId);
            expect(offerMocks.currencyModel.findById).toBeCalledWith(offerMocks.currencyId);

            // checkIfUserOwnsWallet
            expect(offerMocks.walletModel.findById).toBeCalledWith(offerMocks.walletId);

            // checkEnoughBalance
            expect(offerMocks.assetModel.findOne).toBeCalledWith(offerMocks.findAsset);
            expect(offerMocks.offerModel.find).toBeCalledWith(offerMocks.findAsset);

            // checkMaxOffersPerDay
            expect(offerMocks.offerModel.countDocuments).toBeCalledWith({
                ...offersCreatedBy(offerMocks.userId),
                ...offersListed,
                ...offersCreatedToday
            });

            // createOfferFromDTO
            expect(offerMocks.offerModel.create).toBeCalledWith(offerMocks.offerToCreate);
            expect(offerMocks.createdOffer.save).toBeCalledWith();
        });
        test("WalletId precisa corresponder a uma carteira", async () => {
            offerMocks.wrongWalletIdModelMocks()

            const res = async () => await offerService.createOffer(
                offerMocks.userId,
                offerMocks.createOfferDTO
            )

            expect(res).rejects.toThrow(new NotFoundException('There is no document with Id walletId'));

            // checkIdsInCreateOfferDTO
            expect(offerMocks.walletModel.findById).toBeCalledWith(offerMocks.walletId);
        });
        test("CurrencyId precisa corresponder a uma carteira", async () => {
            offerMocks.wrongCurrencyIdModelMocks()

            const res = async () => await offerService.createOffer(
                offerMocks.userId,
                offerMocks.createOfferDTO
            )

            expect(res).rejects.toThrow(new NotFoundException('There is no document with Id currencyId'));

            // checkIdsInCreateOfferDTO
            expect(offerMocks.currencyModel.findById).toBeCalledWith(offerMocks.currencyId);
        });
        test("Somente dono da carteira pode criar oferta com ela", async () => {
            offerMocks.createOfferCorrectlyModelMocks()

            const res = async () => await offerService.createOffer(
                offerMocks.otherUserId,
                offerMocks.createOfferDTO
            )

            expect(res).rejects.toThrow(new UnauthorizedException('User does not own wallet'));

            // checkIfUserOwnsWallet
            expect(offerMocks.walletModel.findById).toBeCalledWith(offerMocks.walletId);
        });
        test("Deve haver asset na moeda da oferta na carteira do usuário", async () => {
            offerMocks.noAssetInWalletModelMocks()

            const res = async () => await offerService.createOffer(
                offerMocks.userId,
                offerMocks.createOfferDTO
            )

            expect(res).rejects.toThrow(new ForbiddenException('Not enough balance'));

            // checkEnoughBalance
            expect(offerMocks.assetModel.findOne).toBeCalledWith(offerMocks.findAsset);
        });
        test("Quantia na oferta precisa ser menor que saldo de moeda na carteira menos quantia ofertada anteriormente", async () => {
            offerMocks.notEnoughBalanceModelMocks()

            const res = async () => await offerService.createOffer(
                offerMocks.userId,
                offerMocks.createOfferDTO
            )

            expect(res).rejects.toThrow(new ForbiddenException('Not enough balance'));

            // checkEnoughBalance
            expect(offerMocks.assetModel.findOne).toBeCalledWith(offerMocks.findAsset);
        });
        test("Máximo de 5 ofertas por dia por usuário", async () => {
            offerMocks.maxOffersPerDayModelMocks()

            const res = async () => await offerService.createOffer(
                offerMocks.userId,
                offerMocks.createOfferDTO
            )

            expect(res).rejects.toThrow(new ForbiddenException('Maximum amount of offers created per day reached'));

            // checkMaxOffersPerDay
            expect(offerMocks.offerModel.countDocuments).toBeCalledWith({
                ...offersCreatedBy(offerMocks.userId),
                ...offersListed,
                ...offersCreatedToday
            });
        });
    });
    describe("unlistOffer", () => {
        test("Deve setar prop 'listed' da oferta (soft-delete)", async () => {
            const mockOffer = offerMocks.offerToUnlist

            offerMocks.offerModel.exec = offerMocks.findOfferById(mockOffer)

            await offerService.unlistOffer(
                offerMocks.userId,
                offerMocks.offerId
            )

            expect(offerMocks.offerModel.findById).toBeCalledWith(offerMocks.offerId)
            expect(mockOffer.save).toBeCalledWith()
            expect(mockOffer.listed).toBe(false)
        });
        test("OfferId precisa corresponder a uma oferta", async () => {
            offerMocks.offerModel.exec = offerMocks.findOfferById(null)

            const res = async () => await offerService.unlistOffer(
                offerMocks.userId,
                offerMocks.offerId
            )

            expect(res).rejects.toThrow(new NotFoundException('There is no offer with Id offerId'))
        });
        test("Somente criador da oferta pode soft-delete", async () => {
            const mockOffer = offerMocks.offerToUnlist

            offerMocks.offerModel.exec = offerMocks.findOfferById(mockOffer)

            const res = async () => await offerService.unlistOffer(
                offerMocks.otherUserId,
                offerMocks.offerId
            )

            expect(res).rejects.toThrow(new UnauthorizedException('User does not own offer'))
        });
    });
});
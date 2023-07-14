import { MAX_OFFERS_PER_DAY } from "../offer.service"
const currency = { _id: 'currencyId' }

const user = {
    _id: {
        toString: jest.fn().mockReturnValue('userId')
    }
}

const wallet = {
    _id: 'walletId',
    user: {
        toString: jest.fn().mockReturnValue('userId')
    }
}

const userIdParams = {
    userId: 'userId'
}

const asset = {
    amount: 15
}

const lowAsset = {
    amount: 4
}

const foundOffers = [
    { amount: 1 },
    { amount: 1 },
    { amount: 1 }
]

const findWallet = { wallet: 'walletId' }
const findAsset = { wallet: 'walletId', currency: 'currencyId' }

const offerToUnlist = {
    _id: 'offerToUnlist',
    user: 'userId',
    listed: true,
    save: jest.fn()
}

const offerService = {
    listOffers: jest.fn(),
    createOffer: jest.fn(),
    unlistOffer: jest.fn()
}
export const model = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    countDocuments: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn()
}

const findOfferById = (mockOffer: any) => jest.fn().mockResolvedValue(mockOffer)

const mockTotalOffers = 22
const mockTotalOffersToday = 4
const mockTooMuchOffersToday = MAX_OFFERS_PER_DAY

const listPaginatedOffersExec = jest.fn().mockResolvedValueOnce(mockTotalOffers).mockResolvedValueOnce([])

const listScrollOffersExec = jest.fn().mockResolvedValueOnce([])

const createOfferCorrectlyModelMocks = () => {
    offerMocks.offerModel.exec = jest.fn()
    .mockResolvedValueOnce(offerMocks.foundOffers)
    .mockResolvedValueOnce(offerMocks.mockTotalOffersToday)

    offerMocks.walletModel.exec = jest.fn().mockResolvedValue(offerMocks.wallet)
    
    offerMocks.currencyModel.exec = jest.fn().mockResolvedValue(offerMocks.currency)

    offerMocks.assetModel.exec = jest.fn().mockResolvedValue(offerMocks.asset)

    offerMocks.offerModel.create = jest.fn().mockResolvedValue(offerMocks.createdOffer)
}

const wrongWalletIdModelMocks = () => {
    offerMocks.walletModel.exec = jest.fn().mockResolvedValue(null)
}

const wrongCurrencyIdModelMocks = () => {
    offerMocks.walletModel.exec = jest.fn().mockResolvedValue(offerMocks.wallet)
    offerMocks.currencyModel.exec = jest.fn().mockResolvedValue(null)
}

const noAssetInWalletModelMocks = () => {
    offerMocks.assetModel.exec = jest.fn().mockResolvedValue(null)
}

const notEnoughBalanceModelMocks = () => {
    offerMocks.assetModel.exec = jest.fn().mockResolvedValue(offerMocks.lowAsset)
}

const maxOffersPerDayModelMocks = () => {
    offerMocks.assetModel.exec = jest.fn().mockResolvedValue(offerMocks.asset)
    
    offerMocks.offerModel.exec = jest.fn()
    .mockResolvedValueOnce(offerMocks.foundOffers)
    .mockResolvedValueOnce(offerMocks.mockTooMuchOffersToday)
}

export const offerMocks = {
    offerService,
    offerModel: { ...model },
    assetModel: { ...model },
    walletModel: { ...model },
    currencyModel: { ...model },
    userIdParams,
    findWallet,
    findAsset,
    wallet,
    user,
    asset,
    lowAsset,
    currency,
    foundOffers,
    mockTotalOffersToday,
    mockTooMuchOffersToday,
    listOfferScrollParams: {
        paginated: false
    },
    listOfferPaginatedParams: {
        paginated: true,
        page: 1,
        limit: 10
    },
    createOfferDTO: {
        walletId: 'walletId',
        currencyId: 'currencyId',
        amount: 2,
        unitPrice: 1234.56
    },
    offerToCreate: {
        user: 'userId',
        wallet: 'walletId',
        currency: 'currencyId',
        amount: 2,
        unitPrice: 1234.56
    },
    createdOffer: {
        user: 'userId',
        wallet: 'walletId',
        currency: 'currencyId',
        amount: 2,
        unitPrice: 1234.56,
        save: jest.fn()
    },
    unlistOfferParams: {
        offerId: 'offerId'
    },
    userId: 'userId',
    offerId: 'offerId',
    walletId: 'walletId',
    currencyId: 'currencyId',
    findOfferById,
    offerToUnlist,
    otherUserId: 'otherUserId',
    listPaginatedOffersExec,
    listScrollOffersExec,
    createOfferCorrectlyModelMocks,
    wrongWalletIdModelMocks,
    wrongCurrencyIdModelMocks,
    noAssetInWalletModelMocks,
    notEnoughBalanceModelMocks,
    maxOffersPerDayModelMocks,
}
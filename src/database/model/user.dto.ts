import { ApiProperty } from "@nestjs/swagger"

export class CurrencyInfo {
    @ApiProperty({ example: '64add7fdac9cabae1b6fdc83' })
    _id: string

    @ApiProperty({ example: 'Bitcoin' })
    name: string
}

export class AssetInfo {
    @ApiProperty({ example: '64add7fdac9cabae1b6fdc83' })
    _id: string

    @ApiProperty({ type: CurrencyInfo })
    currency: CurrencyInfo

    @ApiProperty({ example: 15 })
    amount: number
}

export class WalletInfo {
    @ApiProperty({ example: '64add7fdac9cabae1b6fdc83' })
    _id: string

    @ApiProperty({ example: 'Wallet 1' })
    name: string

    @ApiProperty({ type: AssetInfo, isArray: true })
    assets: AssetInfo[]
}

export class UserInfo {
    @ApiProperty({ example: '64add7fdac9cabae1b6fdc83' })
    _id: string

    @ApiProperty({ example: 'Joe' })
    name: string

    @ApiProperty({ type: WalletInfo, isArray: true })
    wallets: WalletInfo[]
}
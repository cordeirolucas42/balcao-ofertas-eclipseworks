import { ApiProperty } from "@nestjs/swagger"

class ProductDTO {
    @ApiProperty({ example: "pizza" })
    productName: string
  
    @ApiProperty({ example: 2 })
    quantity: number
  
    @ApiProperty({ example: 20.99 })
    value: number
}

export class ListOffersParams {
    @ApiProperty({ example: "507f1f77bcf86cd799439011" })
    userId: string
  
    @ApiProperty({ example: true })
    paginated: boolean
}

export class CreateOfferDTO {
    @ApiProperty({ example: "507f1f77bcf86cd799439011" })
    userId: string

    @ApiProperty({ example: "507f1f77bcf86cd799439011" })
    walletId: string
    
    @ApiProperty({ example: "507f1f77bcf86cd799439011" })
    currencyId: string
  
    @ApiProperty({ example: true })
    amount: number
}

export class UnlistOfferParams {
    @ApiProperty({ example: "507f1f77bcf86cd799439011" })
    userId: string

    @ApiProperty({ example: "507f191e810c19729de860ea" })
    offerId: string
}
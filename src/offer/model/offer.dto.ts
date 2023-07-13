import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsInt, IsNumber, IsPositive, Validate } from 'class-validator'
import { stringToBoolean, stringToNumber } from 'src/common/dataTransformation'
import { IsMongoObjectId } from 'src/common/objectIdValidation.pipe'

export class UserIdParam {
    @ApiProperty({ example: '64add33781674cb2b11a7e22' })
    @Validate(IsMongoObjectId)
    userId: string
}

export class UnlistOfferParam {
    @ApiProperty({ example: '64add33781674cb2b11a7e22' })
    @Validate(IsMongoObjectId)
    offerId: string
}

export class ListOffersParams {
    @ApiProperty({ example: true })
    @Transform(stringToBoolean)
    @IsBoolean()
    paginated: boolean
  
    @ApiPropertyOptional({ example: 1 })
    @Transform(stringToNumber)
    @IsInt()
    @IsPositive()
    page?: number
  
    @ApiPropertyOptional({ example: 5 })
    @Transform(stringToNumber)
    @IsInt()
    @IsPositive()
    limit?: number
}

export class CreateOfferDTO {
    @ApiProperty({ example: '64add33781674cb2b11a7e22' })
    @Validate(IsMongoObjectId)
    walletId: string
    
    @ApiProperty({ example: '64add33781674cb2b11a7e22' })
    @Validate(IsMongoObjectId)
    currencyId: string
  
    @ApiProperty({ example: 15 })
    @IsNumber()
    @IsPositive()
    amount: number
  
    @ApiProperty({ example: 1245.65 })
    @IsNumber()
    @IsPositive()
    unitPrice: number
}

export class OfferId {
    @ApiProperty({ example: '64add7fdac9cabae1b6fdc83' })
    @Validate(IsMongoObjectId)
    _id: string
}
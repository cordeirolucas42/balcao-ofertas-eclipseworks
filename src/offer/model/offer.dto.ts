import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsPositive,
  Validate
} from 'class-validator';
import {
  stringToBoolean,
  stringToNumber
} from '../../common/dataTransformation';
import { IsMongoObjectId } from '../../common/pipes/objectIdValidation.pipe';

export class UserIdParam {
  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  @Validate(IsMongoObjectId)
  userId: string;
}

export class UnlistOfferParam {
  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  @Validate(IsMongoObjectId)
  offerId: string;
}

export class ListOffersParams {
  @ApiProperty({ example: true })
  @Transform(stringToBoolean)
  @IsBoolean()
  paginated: boolean;

  @ApiPropertyOptional({ example: 1 })
  @Transform(stringToNumber)
  @IsInt()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({ example: 5 })
  @Transform(stringToNumber)
  @IsInt()
  @IsPositive()
  limit?: number;
}

export class CreateOfferDTO {
  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  @Validate(IsMongoObjectId)
  walletId: string;

  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  @Validate(IsMongoObjectId)
  currencyId: string;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 1245.65 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class UserDTO {
  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  _id: string;

  @ApiProperty({ example: 'Joe Smith' })
  name: string;
}

export class WalletDTO {
  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  _id: string;

  @ApiProperty({ example: 'Wallet 1' })
  name: string;

  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  user: string;
}

export class CurrencyDTO {
  @ApiProperty({ example: '64add33781674cb2b11a7e22' })
  _id: string;

  @ApiProperty({ example: 'Bitcoin' })
  name: string;
}

export class OfferDTO {
  @ApiProperty({ type: UserDTO })
  user: UserDTO;

  @ApiProperty({ type: WalletDTO })
  wallet: WalletDTO;

  @ApiProperty({ type: CurrencyDTO })
  currency: CurrencyDTO;

  @ApiProperty({ example: 15 })
  amount: number;

  @ApiProperty({ example: 1245.65 })
  unitPrice: number;

  @ApiProperty({ example: new Date() })
  createdAt: Date;
}

export class OfferId {
  @ApiProperty({ example: '64add7fdac9cabae1b6fdc83' })
  @Validate(IsMongoObjectId)
  _id: string;
}

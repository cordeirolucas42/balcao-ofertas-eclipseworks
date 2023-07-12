import { ApiProperty } from '@nestjs/swagger';

export class Paginated<T> {
    @ApiProperty()
    data: T[]

    @ApiProperty({ example: 2 })
    currentPage?: number

    @ApiProperty({ example: 7 })
    lastPage?: number
}
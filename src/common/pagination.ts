import { ApiProperty } from '@nestjs/swagger';

export class Paginated<T> {
    @ApiProperty()
    data: T[]

    @ApiProperty({ example: 2 })
    currentPage?: number

    @ApiProperty({ example: 7 })
    lastPage?: number
}

export class Pagination {
    public readonly skip: number
    public readonly lastPage: number

    public constructor(
        private readonly page: number,
        private readonly limit: number,
        private readonly total: number,
    ) {
        this.skip = (this.page - 1) * this.limit
        this.lastPage = Math.ceil(this.total/this.limit)
    }
}
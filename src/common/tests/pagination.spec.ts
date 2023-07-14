import { stringToBoolean, stringToNumber } from "../dataTransformation";
import { Pagination } from "../pagination";

describe("Pagination", () => {
    const mocks = [
        { page: 1, limit: 10, total: 22, skip: 0, lastPage: 3 },
        { page: 2, limit: 10, total: 22, skip: 10, lastPage: 3 },
        { page: 3, limit: 4, total: 15, skip: 8, lastPage: 4 },
        { page: 100, limit: 5, total: 5, skip: 495, lastPage: 1 },
    ]

    const paginations = mocks.map(({ page, limit, total }) => {
        return new Pagination(page, limit, total)
    })

    describe("pagination", () => {
        test("pagination", () => {
            expect(paginations).toEqual(mocks)
        });
    });
});
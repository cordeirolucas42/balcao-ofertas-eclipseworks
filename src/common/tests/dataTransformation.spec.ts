import { stringToBoolean, stringToNumber } from "../dataTransformation";

describe("Data Transformation", () => {
    const mockNumberString = { value: '2' }
    const mockWrongNumberString = { value: 'true' }
    const mockBooleanStringCases = [
        { value: 'true'},
        { value: 'false'},
        { value: '1'},
        { value: '0'},
    ]
    const mockWrongBooleanString = { value: 'x'}
    describe("stringToNumber", () => {
        test("stringToNumber right", () => {
            const res = stringToNumber(mockNumberString)
            expect(res).toBe(2)
        });
        test("stringToNumber wrong", () => {
            const res = stringToNumber(mockWrongNumberString)
            expect(res).toBe(NaN)
        });
    })
    describe("stringToBoolean", () => {
        test("stringToBoolean right", () => {
            const res = stringToBoolean(mockBooleanStringCases[0])
            expect(res).toBe(true)
        });
        test("stringToBoolean right", () => {
            const res = stringToBoolean(mockBooleanStringCases[1])
            expect(res).toBe(false)
        });
        test("stringToBoolean right", () => {
            const res = stringToBoolean(mockBooleanStringCases[2])
            expect(res).toBe(true)
        });
        test("stringToBoolean right", () => {
            const res = stringToBoolean(mockBooleanStringCases[3])
            expect(res).toBe(false)
        });
        test("stringToBoolean wrong", () => {
            const res = stringToBoolean(mockWrongBooleanString)
            expect(res).toBe(null)
        });
    })
});
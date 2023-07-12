export const stringToNumber = (args: any) => {
    return +args.value
}

export const stringToBoolean = (args: any) => {
    return args.value === 'true'
}
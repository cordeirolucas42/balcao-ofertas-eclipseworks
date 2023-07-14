export const stringToNumber = (args: { value: any }) => {
  return +args.value;
};

export const stringToBoolean = (args: { value: any }) => {
  switch (args.value) {
    case 'true':
      return true;
    case '1':
      return true;
    case 'false':
      return false;
    case '0':
      return false;
    default:
      return null;
  }
};

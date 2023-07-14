import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import * as mongoose from 'mongoose';

@ValidatorConstraint({ name: 'objectIdValidation', async: false })
export class IsMongoObjectId implements ValidatorConstraintInterface {
  validate(objectId: string, args: ValidationArguments) {
    return mongoose.isValidObjectId(objectId)
  }

  defaultMessage(args: ValidationArguments) {
    return '$value is not a valid $property';
  }
}
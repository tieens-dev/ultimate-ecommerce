import {
  DATABASE_CREATED_AT_FIELD_NAME,
  DATABASE_DELETED_AT_FIELD_NAME,
  DATABASE_UPDATED_AT_FIELD_NAME
} from '@common/database/constants/database.constant'

export abstract class DatabaseEntityAbstract<T = any> {
  abstract _id: T;
  abstract [DATABASE_DELETED_AT_FIELD_NAME]?: Date;
  abstract [DATABASE_CREATED_AT_FIELD_NAME]?: Date;
  abstract [DATABASE_UPDATED_AT_FIELD_NAME]?: Date
}

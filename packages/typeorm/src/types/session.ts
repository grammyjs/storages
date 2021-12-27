import { ObjectID } from 'typeorm';

export interface ISession {
  id: string | ObjectID;
  key: string;
  value: string;
}
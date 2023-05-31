import { ObjectId } from 'typeorm';

export interface ISession {
  id: string | ObjectId | number;
  key: string;
  value: string;
}
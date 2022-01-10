import { DataTypes, Model } from './deps.ts';

export class Session extends Model {
  static table = 'sessions';

  static fields = {
    key: { primaryKey: true, type: DataTypes.STRING },
    value: { type: DataTypes.TEXT, allowNull: false },
  };
}

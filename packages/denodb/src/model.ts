import { DenoDB } from './deps.ts';

export class Session extends DenoDB.Model {
  static table = 'sessions';

  static fields = {
    key: { primaryKey: true, type: DenoDB.DataTypes.STRING },
    value: { type: DenoDB.DataTypes.TEXT, allowNull: false },
  };
}

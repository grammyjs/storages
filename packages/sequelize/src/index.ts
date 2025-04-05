import { StorageAdapter } from 'grammy'
import { Repository } from 'sequelize-typescript'

export class SequelizeAdapter<T> implements StorageAdapter<T> {
  private repository: Repository<any>

  constructor (options: { repository: Repository<any> }) {
    this.repository = options.repository
  }

  async read (key: string) {
    const session = await this.repository.findOne({ where: { key: key } })
    if (session === null || session === undefined) {
      return undefined
    }
    return JSON.parse(session.value) as unknown as T
  }

  async write (key: string, value: T) {
    const jsonValue = JSON.stringify(value)
    await this.repository.upsert({key: key, value: jsonValue})
  }

  async delete (key: string) {
    await this.repository.destroy({ where: { key: key } })
  }

}

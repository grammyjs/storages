import { StorageAdapter } from './deps.deno.ts';

export interface BaseConfig {
  baseName: string;
  projectKey: string;
}

type Method = 'GET' | 'PUT' | 'DELETE';

export class DetaAdapter<T> implements StorageAdapter<T> {
  private readonly project: BaseConfig;
  private readonly rootUrl: string;

  constructor(project: BaseConfig) {
    this.project = project;
    const projectId = project.projectKey.split('_')[0];
    this.rootUrl =
      `https://database.deta.sh/v1/${projectId}/${project.baseName}/items`;
  }

  private async request(
    method: Method,
    key: string,
    body?: { items: T[] },
  ) {
    const apiUrl = `${this.rootUrl}${key}`;
    return await fetch(apiUrl, {
      method: method,
      body: JSON.stringify(body),
      headers: new Headers({
        'X-API-Key': this.project.projectKey,
        'Content-Type': 'application/json',
      }),
    });
  }

  async read(key: string) {
    key = `/${encodeURIComponent(key)}`;
    const res = await this.request('GET', key);
    if (!res.ok) return undefined;
    return await res.json();
  }

  async write(
    key: string,
    value: T,
  ) {
    return await (await this.request('PUT', '', {
      items: [{
        key: encodeURIComponent(key),
        ...value,
      }],
    })).json();
  }

  async delete(key: string) {
    key = `/${encodeURIComponent(key)}`;
    return await (await this.request('DELETE', key)).json();
  }
}
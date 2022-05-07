export type { StorageAdapter } from 'grammy';
import { readFile, writeFile, rm, stat, mkdir } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

interface SystemError {
  code?: string;
  errno?: number;
  syscall?: string;
  path?: string;
}

export const fs = {
  readFile: (path: string) => readFile(path, { encoding: 'utf-8' }),
  writeFile: (path: string, data: string) => writeFile(path, data, { encoding: 'utf-8' }),
  existsSync,
  ensureDir: async (path: string) => {
    try {
      await stat(path);
    } catch (e) {
      if ((e as SystemError).code === 'ENOENT') {
        await mkdir(path, { recursive: true });
      } else throw e;
    }
  },
  ensureDirSync: (path: string) => mkdirSync(path, { recursive: true }),
  remove: (path: string) => rm(path, { recursive: true }),
};

export const path = {
  resolve,
};

export const cwd = process.cwd;

export interface Session {
  key: string;
  value: string;
}

interface Where {
  key: string;
}

interface Create {
  key: string;
  value: string;
}

interface Update {
  value: string;
}

export interface SessionDelegate {
  findUnique: (input: { where: Where }) => Promise<Session | null>;
  upsert: (input: {
    where: Where;
    create: Create;
    update: Update;
  }) => Promise<Session>;
  delete: (input: { where: Where }) => Promise<Session>;
}

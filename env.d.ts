declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_EXPIRE_DAYS: number;
    }
  }
}

export {};

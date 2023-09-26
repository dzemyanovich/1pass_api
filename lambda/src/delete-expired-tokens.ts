import { deleteExpiredTokens } from './utils/firebase';

export async function handler(): Promise<void> {
  await deleteExpiredTokens();
}

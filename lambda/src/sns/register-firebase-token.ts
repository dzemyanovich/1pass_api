import type { SNSEvent } from 'aws-lambda';

import { storeFirebaseToken } from '../utils/firebase';

export async function handler(event: SNSEvent): Promise<void> {
  const request: RegisterFirebaseRequest = JSON.parse(event.Records[0].Sns.Message);
  // no need to validate data since it was already validated in sign-in lambda
  const { tokenData, firebaseToken } = request;

  await storeFirebaseToken(tokenData, firebaseToken);
}

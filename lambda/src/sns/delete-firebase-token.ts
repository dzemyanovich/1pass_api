import type { SNSEvent } from 'aws-lambda';

import { deleteFirebaseToken } from '../utils/firebase';

export async function handler(event: SNSEvent): Promise<void> {
  const request: DeleteTokenRequest = JSON.parse(event.Records[0].Sns.Message);
  // no need to validate data since it was already validated in sign-out lambda
  const { userId, firebaseToken } = request;

  await deleteFirebaseToken(userId, firebaseToken);
}

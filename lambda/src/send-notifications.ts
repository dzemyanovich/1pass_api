import type { SNSEvent } from 'aws-lambda';

import { sendNotifications } from './utils/firebase';

export async function handler(event: SNSEvent): Promise<void> {
  const request: SendNotificationsRequest = JSON.parse(event.Records[0].Sns.Message);
  // no need to validate data since it was already validated in confirm-visit lambda
  const { userId, bookingId, visitTime, title, body } = request;

  await sendNotifications(
    userId,
    bookingId,
    visitTime,
    title,
    body,
  );
}

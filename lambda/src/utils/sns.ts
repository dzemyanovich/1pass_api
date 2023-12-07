import { SNS, STS } from 'aws-sdk';

export async function publishMessage<T>(message: T, snsTopicName: string): Promise<void> {
  const sts = new STS();
  const { Account: awsAccountId } = await sts.getCallerIdentity({}).promise();

  const sns = new SNS();
  const { PRODUCT, NODE_ENV, AWS_REGION } = process.env;
  const snsTopicArn = `arn:aws:sns:${AWS_REGION}:${awsAccountId}:${PRODUCT}-${NODE_ENV}-${snsTopicName}`;
  const params = {
    Message: JSON.stringify(message),
    TopicArn: snsTopicArn,
  };
  await sns.publish(params).promise();
}

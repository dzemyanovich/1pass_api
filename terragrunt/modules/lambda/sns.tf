resource "aws_sns_topic" "send_notifications" {
  name = "${var.product}-${var.env}-send-notifications"
}

resource "aws_sns_topic_subscription" "send_notifications_subscription" {
  topic_arn = aws_sns_topic.send_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.send_notifications_lambda.arn
}

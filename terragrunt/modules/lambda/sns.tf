resource "aws_sns_topic" "send_notifications_sns" {
  name = "${var.product}-${var.env}-send-notifications"
}

resource "aws_sns_topic" "delete_firebase_token_sns" {
  name = "${var.product}-${var.env}-delete-firebase-token"
}

resource "aws_sns_topic" "register_firebase_token_sns" {
  name = "${var.product}-${var.env}-register-firebase-token"
}

resource "aws_sns_topic_subscription" "send_notifications_subscription" {
  topic_arn  = aws_sns_topic.send_notifications_sns.arn
  protocol   = "lambda"
  endpoint   = aws_lambda_function.send_notifications_lambda.arn
  depends_on = [aws_sns_topic.send_notifications_sns]
}

resource "aws_sns_topic_subscription" "delete_firebase_token_subscription" {
  topic_arn  = aws_sns_topic.delete_firebase_token_sns.arn
  protocol   = "lambda"
  endpoint   = aws_lambda_function.delete_firebase_token_lambda.arn
  depends_on = [aws_sns_topic.delete_firebase_token_sns]
}

resource "aws_sns_topic_subscription" "register_firebase_token_subscription" {
  topic_arn  = aws_sns_topic.register_firebase_token_sns.arn
  protocol   = "lambda"
  endpoint   = aws_lambda_function.register_firebase_token_lambda.arn
  depends_on = [aws_sns_topic.register_firebase_token_sns]
}

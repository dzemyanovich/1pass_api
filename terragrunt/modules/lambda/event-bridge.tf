#################### add-today-bookings ####################

resource "aws_cloudwatch_event_rule" "add_today_bookings_cron_job" {
  count               = "${var.is_dev_env ? 1 : 0}"
  name                = "${var.product}-${var.env}-add-today-bookings-cron-job"
  description         = "Invoke add-today-bookings lambda every 24 hours"
  schedule_expression = "cron(0 21 * * ? *)" // 21:00 UTC each day (00:00 Minst time each day)
}

resource "aws_cloudwatch_event_target" "add_today_bookings_lambda_target" {
  count     = "${var.is_dev_env ? 1 : 0}"
  rule      = aws_cloudwatch_event_rule.add_today_bookings_cron_job[0].name
  target_id = aws_lambda_function.add_today_bookings_lambda.id
  arn       = aws_lambda_function.add_today_bookings_lambda.arn
}

resource "aws_lambda_permission" "call_add_today_bookings_lambda" {
  count         = "${var.is_dev_env ? 1 : 0}"
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_today_bookings_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.add_today_bookings_cron_job[0].arn
}

#################### delete-expired-tokens ####################

resource "aws_cloudwatch_event_rule" "delete_expired_tokens_cron_job" {
  count               = "${var.is_dev_env ? 1 : 0}"
  name                = "${var.product}-${var.env}-delete-expired-tokens-cron-job"
  description         = "Invoke delete-expired-tokens lambda every 24 hours"
  schedule_expression = "cron(0 21 * * ? *)" // 21:00 UTC each day (00:00 Minst time each day)
}

resource "aws_cloudwatch_event_target" "delete_expired_tokens_lambda_target" {
  count     = "${var.is_dev_env ? 1 : 0}"
  rule      = aws_cloudwatch_event_rule.delete_expired_tokens_cron_job[0].name
  target_id = aws_lambda_function.delete_expired_tokens_lambda.id
  arn       = aws_lambda_function.delete_expired_tokens_lambda.arn
}

resource "aws_lambda_permission" "call_delete_expired_tokens_lambda" {
  count         = "${var.is_dev_env ? 1 : 0}"
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_expired_tokens_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.delete_expired_tokens_cron_job[0].arn
}

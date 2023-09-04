resource "aws_cloudwatch_event_rule" "add_today_bookings_cron_job" {
  name = "${var.product}-${var.env}-add-today-bookings-cron-job"
  description = "Invoke add-today-bookings lambda every 24 hours"
  schedule_expression = "cron(0 21 * * ? *)" // 21:00 UTC each day (00:00 Minst time each day)
}

resource "aws_cloudwatch_event_target" "add_today_bookings_lambda_target" {
  rule      = aws_cloudwatch_event_rule.add_today_bookings_cron_job.name
  target_id = aws_lambda_function.add_today_bookings_lambda.id
  arn       = aws_lambda_function.add_today_bookings_lambda.arn
}

resource "aws_lambda_permission" "call_add_today_bookings_lambda" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_today_bookings_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.add_today_bookings_cron_job.arn
}

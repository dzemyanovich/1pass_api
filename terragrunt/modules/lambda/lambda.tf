resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.product}_${var.env}_iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_basic_access" {
  role       = aws_iam_role.iam_for_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "get_sport_objects_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-get-sport-objects"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "src/get-sport-objects.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = "nodejs18.x"

  environment {
    variables = {
      NODE_ENV            = var.env
      PREPROD_DB_USERNAME = var.PROD_DB_USERNAME
      PREPROD_DB_PASSWORD = var.PROD_DB_PASSWORD
      PREPROD_DB_NAME     = var.PROD_DB_NAME
      PREPROD_DB_HOST     = var.PROD_DB_HOST
      PROD_DB_USERNAME    = var.PROD_DB_USERNAME
      PROD_DB_PASSWORD    = var.PROD_DB_PASSWORD
      PROD_DB_NAME        = var.PROD_DB_NAME
      PROD_DB_HOST        = var.PROD_DB_HOST
    }
  }
}

resource "aws_lambda_function" "auth_send_code_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-auth-send-code"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "src/auth-send-code.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = "nodejs18.x"

  environment {
    variables = {
      TWILIO_AUTH_TOKEN  = var.TWILIO_AUTH_TOKEN
      TWILIO_ACCOUNT_SID = var.TWILIO_ACCOUNT_SID
      TWILIO_VERIFY_SID  = var.TWILIO_VERIFY_SID
    }
  }
}

resource "aws_lambda_function" "auth_verify_code_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-auth-verify-code"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "src/auth-verify-code.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = "nodejs18.x"

  environment {
    variables = {
      TWILIO_AUTH_TOKEN  = var.TWILIO_AUTH_TOKEN
      TWILIO_ACCOUNT_SID = var.TWILIO_ACCOUNT_SID
      TWILIO_VERIFY_SID  = var.TWILIO_VERIFY_SID
    }
  }
}

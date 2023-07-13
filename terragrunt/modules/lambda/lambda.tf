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

resource "aws_lambda_function" "get_sport_objects_lambda" {
  filename          = data.archive_file.lambda_zip.output_path
  function_name     = "${var.product}-${var.env}-get-sport-objects"
  role              = aws_iam_role.iam_for_lambda.arn
  handler           = "get-sport-objects.handler"
  source_code_hash  = data.archive_file.lambda_zip.output_base64sha256
  runtime           = "nodejs18.x"

  environment {
    variables = {
      NODE_ENV = var.env
      PREPROD_DB_USERNAME = var.PREPROD_DB_USERNAME
      PREPROD_DB_PASSWORD = var.PREPROD_DB_PASSWORD
      PREPROD_DB_NAME     = var.PREPROD_DB_NAME
      PREPROD_DB_HOST     = var.PREPROD_DB_HOST
    }
  }
}

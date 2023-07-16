data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${var.root_dir}/lambda"
  output_path = "${var.root_dir}/lambda.zip"
}

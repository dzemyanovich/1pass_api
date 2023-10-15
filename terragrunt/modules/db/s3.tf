locals {
  bucket_name = "${var.product}-${var.env}-files-storage"
}

resource "aws_s3_bucket" "files_storage_bucket" {
  count  = "${var.is_dev_env ? 1 : 0}"
  bucket = local.bucket_name

  tags = {
    Environment = var.env
  }
}

resource "aws_s3_bucket_public_access_block" "files_storage_bucket_public_access" {
  count  = "${var.is_dev_env ? 1 : 0}"
  bucket = aws_s3_bucket.files_storage_bucket[0].id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "files_storage_bucket_policy" {
  count  = "${var.is_dev_env ? 1 : 0}"
  bucket = aws_s3_bucket.files_storage_bucket[0].id
  policy = templatefile("data/s3-policy.json", { bucket = local.bucket_name })

  depends_on = [aws_s3_bucket_public_access_block.files_storage_bucket_public_access[0]]
}

resource "aws_s3_bucket_ownership_controls" "files_storage_bucket_ownnership" {
  count  = "${var.is_dev_env ? 1 : 0}"
  bucket = aws_s3_bucket.files_storage_bucket[0].id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }

  depends_on = [aws_s3_bucket_public_access_block.files_storage_bucket_public_access[0]]
}

resource "aws_s3_bucket_acl" "files_storage_bucket_acl" {
  count  = "${var.is_dev_env ? 1 : 0}"
  bucket = aws_s3_bucket.files_storage_bucket[0].id
  acl    = "private"

  depends_on = [aws_s3_bucket_ownership_controls.files_storage_bucket_ownnership[0]]
}

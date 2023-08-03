variable "product" {
  type    = string
  default = "1pass"
}

variable "env" {
  type = string
}

variable "PREPROD_DB_USERNAME" {
  type    = string
  default = ""
}

variable "PREPROD_DB_PASSWORD" {
  type    = string
  default = ""
}

variable "PREPROD_DB_NAME" {
  type    = string
  default = ""
}

variable "PREPROD_DB_HOST" {
  type    = string
  default = ""
}

variable "PROD_DB_USERNAME" {
  type    = string
  default = ""
}

variable "PROD_DB_PASSWORD" {
  type    = string
  default = ""
}

variable "PROD_DB_NAME" {
  type    = string
  default = ""
}

variable "PROD_DB_HOST" {
  type    = string
  default = ""
}

variable "root_dir" {
  type = string
}

variable "TWILIO_AUTH_TOKEN" {
  type    = string
  default = ""
}

variable "TWILIO_ACCOUNT_SID" {
  type    = string
  default = ""
}

variable "TWILIO_VERIFY_SID" {
  type    = string
  default = ""
}

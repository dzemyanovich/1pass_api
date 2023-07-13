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

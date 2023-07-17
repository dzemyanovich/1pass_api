variable "product" {
  type    = string
  default = "one-pass" # only lowercase alphanumeric characters and hyphens allowed in "identifier"
}

variable "env" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_password" {
  type = string
}

variable "is_dev_env" {
  type    = bool
  default = false
}

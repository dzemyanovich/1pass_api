# custom security group is required for connection from MySQL Workbench
resource "aws_security_group" "mysql_security_group" {
  // having db per each env is costly
  count = "${var.is_dev_env ? 1 : 0}"
  name  = "${var.product}-${var.env}-mysql-security-group"
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "one_pass_db" {
  // having db per each env is costly
  count                       = "${var.is_dev_env ? 1 : 0}"
  allocated_storage           = 10
  identifier                  = "${var.product}-${var.env}-db"
  engine                      = "mysql"
  engine_version              = "5.7"
  instance_class              = "db.t3.micro"
  username                    = var.db_username
  password                    = var.db_password
  parameter_group_name        = "default.mysql5.7"
  # uncomment when db is created per each env
  # vpc_security_group_ids      = [aws_security_group.mysql_security_group.id]
  vpc_security_group_ids      = [aws_security_group.mysql_security_group[0].id]
  skip_final_snapshot         = true // makes possible deletion of db
  publicly_accessible         = true
}

# custom security group is required for connection from MySQL Workbench
resource "aws_security_group" "mysql_security_group" {
  // having db per each env is costly
  // name = "${var.product}-${var.env}-mysql-security-group"
  name = "${var.product}-dev1-mysql-security-group"
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
  allocated_storage           = 10
  // having db per each env is costly
  // identifier                  = "${var.product}-${var.env}-db"
  identifier                  = "${var.product}-dev1-db"
  engine                      = "mysql"
  engine_version              = "5.7"
  instance_class              = "db.t3.micro"
  username                    = var.db_username
  password                    = var.db_password
  parameter_group_name        = "default.mysql5.7"
  vpc_security_group_ids      = [aws_security_group.mysql_security_group.id]
  skip_final_snapshot         = true // makes possible deletion of db
  publicly_accessible         = true
}

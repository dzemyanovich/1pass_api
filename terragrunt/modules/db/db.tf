# custom security group is required for connection from MySQL Workbench
resource "aws_security_group" "mysql_security_group" {
  name = "mysql_security_group"
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
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
  identifier                  = "${var.env}-1pass-db"
  engine                      = "mysql"
  engine_version              = "5.7"
  instance_class              = "db.t3.micro"
  username                    = var.db_username
  password                    = var.db_password
  parameter_group_name        = "default.mysql5.7"
  vpc_security_group_ids      = [aws_security_group.mysql_security_group.id]
  final_snapshot_identifier   = false
  publicly_accessible         = true
}

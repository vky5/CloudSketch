provider "aws" {
  region = "us-east-1"
}

# Security group for DB (allow local access only)
resource "aws_security_group" "rds_sg" {
  name        = "rds_sg"
  description = "Allow inbound DB traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # for demo, in real-world restrict
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Subnet group (RDS needs this, can't launch in a single subnet directly)
resource "aws_db_subnet_group" "rds_subnet" {
  name       = "rds_subnet_group"
  subnet_ids = [aws_subnet.public1.id, aws_subnet.public2.id]

  tags = {
    Name = "RDS subnet group"
  }
}

# The actual DB instance
resource "aws_db_instance" "rds" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "13.7"
  instance_class       = "db.t3.micro"
  db_name              = "mydb"
  username             = "admin"
  password             = "changeme123"
  parameter_group_name = "default.postgres13"
  skip_final_snapshot  = true

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet.name

  tags = {
    Name = "MyRDS"
  }
}

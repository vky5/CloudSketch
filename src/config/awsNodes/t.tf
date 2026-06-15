provider "aws" {
  region = "us-east-1"
}

# ---------- Networking ----------
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "subnet" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
}

resource "aws_security_group" "sg" {
  name        = "allow_ssh"
  description = "Allow SSH inbound"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
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

# ---------- EC2 Instance ----------
resource "aws_instance" "my_ec2" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.subnet.id
  key_name      = "your-key-name" # Replace with your key
  security_groups = [aws_security_group.sg.name]

  user_data = <<-EOF
              #!/bin/bash
              # Wait for the attached volume to show up
              DEVICE=/dev/xvdf
              MOUNTPOINT=/mnt/myvolume
              while [ ! -b $DEVICE ]; do sleep 1; done
              mkdir -p $MOUNTPOINT
              
              # Format if not formatted
              FILESYSTEM=$(blkid -o value -s TYPE $DEVICE)
              if [ -z "$FILESYSTEM" ]; then
                mkfs -t ext4 $DEVICE
              fi
              
              mount $DEVICE $MOUNTPOINT
              echo "$DEVICE $MOUNTPOINT ext4 defaults,nofail 0 2" >> /etc/fstab
              EOF
}

# ---------- EBS Volume ----------
resource "aws_ebs_volume" "my_volume" {
  availability_zone = aws_instance.my_ec2.availability_zone
  size              = 10 # GB
  type              = "gp3"
  tags = {
    Name = "MyEBSVolume"
  }
}

# ---------- Attach EBS to EC2 ----------
resource "aws_volume_attachment" "ebs_attach" {
  device_name = "/dev/sdf"  # Will appear as /dev/xvdf in Amazon Linux
  volume_id   = aws_ebs_volume.my_volume.id
  instance_id = aws_instance.my_ec2.id
}

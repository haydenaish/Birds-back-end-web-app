-- create user
CREATE USER 'cosc203' IDENTIFIED BY 'password';


GRANT ALL ON *.* TO 'cosc203' WITH GRANT OPTION;


-- create database
-- ALTER TABLE Bird DROP FOREIGN KEY bird_ibfk_1;
-- DROP TABLE IF EXISTS ConservationStatus;
DROP DATABASE IF EXISTS ASGN2;


CREATE DATABASE ASGN2;
USE ASGN2;


-- create tables
CREATE TABLE ConservationStatus (
status_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
status_name VARCHAR(255) NOT NULL,
status_colour CHAR(7) NOT NULL
);


CREATE TABLE Bird (
bird_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
english_name VARCHAR(255) NOT NULL,
primary_name VARCHAR(255) NOT NULL,
scientific_name VARCHAR(255) NOT NULL,
order_name VARCHAR(255) NOT NULL,
family VARCHAR(255) NOT NULL,
length INT NOT NULL,
weight INT NOT NULL,
status_id INT,
FOREIGN KEY (status_id) REFERENCES ConservationStatus(status_id)


);
CREATE TABLE Photos (
photo_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
photographer VARCHAR(255) NOT NULL,
filename VARCHAR(255) NOT NULL,
bird_id INT,
FOREIGN KEY (bird_id) REFERENCES Bird(bird_id)
);




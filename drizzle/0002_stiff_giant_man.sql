CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`domain` varchar(255) NOT NULL,
	`postedAt` timestamp NOT NULL DEFAULT (now()),
	`executionLogId` int,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`),
	CONSTRAINT `leads_email_unique` UNIQUE(`email`)
);

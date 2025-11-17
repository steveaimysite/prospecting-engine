CREATE TABLE `execution_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`status` enum('running','completed','failed') NOT NULL,
	`domainsFound` int DEFAULT 0,
	`emailsFound` int DEFAULT 0,
	`leadsPosted` int DEFAULT 0,
	`errorMessage` text,
	`searchQuery` text,
	`triggeredBy` varchar(50) DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `execution_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `icp_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attribute` varchar(100) NOT NULL,
	`value` varchar(255) NOT NULL,
	`weight` decimal(3,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `icp_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_recipients_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_recipients_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_key_unique` UNIQUE(`key`)
);

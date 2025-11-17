CREATE TABLE `ab_test_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`icpSnapshot` text NOT NULL,
	`executionCount` int NOT NULL DEFAULT 0,
	`totalLeads` int NOT NULL DEFAULT 0,
	`avgEngagement` varchar(10) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_test_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ab_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','running','completed','cancelled') NOT NULL DEFAULT 'draft',
	`startedAt` timestamp,
	`completedAt` timestamp,
	`winningVariantId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_tests_id` PRIMARY KEY(`id`)
);

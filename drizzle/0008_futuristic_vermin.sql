CREATE TABLE `contentReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterUserId` int,
	`postId` int,
	`reportedUserId` int,
	`reason` varchar(120) NOT NULL,
	`details` text,
	`status` enum('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplacePosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`postType` enum('product','service','job','online_work','real_estate','vehicle','classified') NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text,
	`country` varchar(120),
	`city` varchar(120),
	`language` varchar(12) NOT NULL DEFAULT 'en',
	`currency` varchar(8) NOT NULL DEFAULT 'EUR',
	`priceCents` int,
	`remote` enum('yes','no','hybrid') NOT NULL DEFAULT 'no',
	`status` enum('draft','pending','active','paused','rejected','archived') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplacePosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postInquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`ownerId` int NOT NULL,
	`requesterUserId` int,
	`requesterName` varchar(160) NOT NULL,
	`requesterContact` varchar(160) NOT NULL,
	`message` text,
	`status` enum('new','contacted','closed','cancelled') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `postInquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `accountType` enum('customer','seller','service_provider','employer','freelancer') DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `country` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `city` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `preferredLanguage` varchar(12) DEFAULT 'en';--> statement-breakpoint
ALTER TABLE `users` ADD `preferredCurrency` varchar(8) DEFAULT 'EUR';
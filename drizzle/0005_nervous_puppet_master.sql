CREATE TABLE `serviceProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`bio` text,
	`location` varchar(180),
	`avatarUrl` text,
	`status` enum('draft','active','paused') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `serviceProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `serviceRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`providerUserId` int NOT NULL,
	`buyerUserId` int,
	`buyerName` varchar(160) NOT NULL,
	`buyerPhone` varchar(40) NOT NULL,
	`message` text,
	`agreedPriceCents` int NOT NULL,
	`commissionCents` int NOT NULL,
	`commissionRateBps` int NOT NULL,
	`status` enum('received','contacted','accepted','completed','cancelled') NOT NULL DEFAULT 'received',
	`commissionCollectionStatus` enum('pending','collected','waived') NOT NULL DEFAULT 'pending',
	`commissionCollectedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `serviceRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerUserId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text NOT NULL,
	`location` varchar(180),
	`priceCents` int NOT NULL,
	`imageUrl` text,
	`commissionRateBps` int NOT NULL DEFAULT 1000,
	`status` enum('draft','pending','active','paused','archived') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);

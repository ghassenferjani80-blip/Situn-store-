CREATE TABLE `commissionSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` varchar(80) NOT NULL,
	`sellerRateBps` int NOT NULL,
	`buyerRateBps` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissionSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `commissionSettings_category_unique` UNIQUE(`category`)
);

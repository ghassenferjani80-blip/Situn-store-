ALTER TABLE `orders` ADD `commissionRateBps` int DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `buyerFeeCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `buyerFeeRateBps` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `commissionCollectionStatus` enum('pending','collected','waived') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `commissionCollectedAt` timestamp;
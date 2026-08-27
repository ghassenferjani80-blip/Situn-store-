ALTER TABLE `serviceProfiles` ADD `country` varchar(120);--> statement-breakpoint
ALTER TABLE `serviceProfiles` ADD `languages` varchar(500);--> statement-breakpoint
ALTER TABLE `services` ADD `country` varchar(120);--> statement-breakpoint
ALTER TABLE `services` ADD `languages` varchar(500);--> statement-breakpoint
ALTER TABLE `services` ADD `deliveryMode` enum('online','local','hybrid') DEFAULT 'online' NOT NULL;
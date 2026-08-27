CREATE TABLE `marketplaceTaxonomies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('category','country') NOT NULL,
	`value` varchar(120) NOT NULL,
	`labelAr` varchar(160) NOT NULL,
	`labelFr` varchar(160) NOT NULL,
	`labelEn` varchar(160) NOT NULL,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceTaxonomies_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplaceTaxonomies_kind_value_unique` UNIQUE(`kind`,`value`)
);

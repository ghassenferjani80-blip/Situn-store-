CREATE TABLE `servicePayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceRequestId` int NOT NULL,
	`amountReceivedCents` int NOT NULL,
	`commissionCents` int NOT NULL,
	`providerPayoutCents` int NOT NULL,
	`paymentMethod` enum('cash','bank_transfer','other') NOT NULL DEFAULT 'bank_transfer',
	`status` enum('pending','received','provider_paid','settled','cancelled') NOT NULL DEFAULT 'pending',
	`ownerNote` text,
	`receivedAt` timestamp,
	`providerPaidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servicePayments_id` PRIMARY KEY(`id`),
	CONSTRAINT `servicePayments_request_unique` UNIQUE(`serviceRequestId`)
);

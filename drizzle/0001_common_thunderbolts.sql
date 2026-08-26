CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`sellerId` int NOT NULL,
	`productName` varchar(180) NOT NULL,
	`quantity` int NOT NULL,
	`unitPriceCents` int NOT NULL,
	`lineTotalCents` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`customerPhone` varchar(40) NOT NULL,
	`deliveryAddress` text NOT NULL,
	`note` text,
	`subtotalCents` int NOT NULL,
	`commissionCents` int NOT NULL,
	`sellerNetCents` int NOT NULL,
	`paymentMethod` enum('cash_on_delivery') NOT NULL DEFAULT 'cash_on_delivery',
	`status` enum('received','confirmed','delivered','cancelled') NOT NULL DEFAULT 'received',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL,
	`description` text,
	`imageUrl` text,
	`priceCents` int NOT NULL,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sellers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`whatsapp` varchar(32) NOT NULL,
	`commissionRateBps` int NOT NULL DEFAULT 1000,
	`status` enum('pending','active','paused') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sellers_id` PRIMARY KEY(`id`)
);

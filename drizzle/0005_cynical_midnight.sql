CREATE TABLE `alertHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`metric` enum('TEMP','RH','PPFD') NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`targetMin` decimal(10,2),
	`targetMax` decimal(10,2),
	`message` text NOT NULL,
	`notificationSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alertSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`alertsEnabled` boolean NOT NULL DEFAULT true,
	`tempEnabled` boolean NOT NULL DEFAULT true,
	`rhEnabled` boolean NOT NULL DEFAULT true,
	`ppfdEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alertHistory` ADD CONSTRAINT `alertHistory_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD CONSTRAINT `alertSettings_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tentIdx` ON `alertHistory` (`tentId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `alertHistory` (`createdAt`);
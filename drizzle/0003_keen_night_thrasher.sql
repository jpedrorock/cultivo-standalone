CREATE TABLE `calculationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`calculatorType` enum('IRRIGATION','FERTILIZATION','LUX_PPFD') NOT NULL,
	`parametersJson` text NOT NULL,
	`resultJson` text NOT NULL,
	`title` varchar(200),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calculationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `calculationHistory` ADD CONSTRAINT `calculationHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userIdx` ON `calculationHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `typeIdx` ON `calculationHistory` (`calculatorType`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `calculationHistory` (`createdAt`);
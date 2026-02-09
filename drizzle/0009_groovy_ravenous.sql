CREATE TABLE `notificationHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('daily_reminder','environment_alert','task_reminder') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`metadata` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `typeIdx` ON `notificationHistory` (`type`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `notificationHistory` (`sentAt`);
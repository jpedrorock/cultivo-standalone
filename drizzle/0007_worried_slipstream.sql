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
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`alertType` enum('OUT_OF_RANGE','SAFETY_LIMIT','TREND') NOT NULL,
	`metric` enum('TEMP','RH','PPFD') NOT NULL,
	`logDate` timestamp NOT NULL,
	`turn` enum('AM','PM'),
	`value` decimal(10,2),
	`message` text NOT NULL,
	`status` enum('NEW','SEEN') NOT NULL DEFAULT 'NEW',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cloningEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`status` enum('ACTIVE','FINISHED') NOT NULL DEFAULT 'ACTIVE',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cloningEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`strainId` int NOT NULL,
	`startDate` timestamp NOT NULL,
	`floraStartDate` timestamp,
	`status` enum('ACTIVE','FINISHED') NOT NULL DEFAULT 'ACTIVE',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`logDate` timestamp NOT NULL,
	`turn` enum('AM','PM') NOT NULL,
	`tempC` decimal(4,1),
	`rhPct` decimal(4,1),
	`ppfd` int,
	`ph` decimal(3,1),
	`ec` decimal(4,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyLogs_id` PRIMARY KEY(`id`),
	CONSTRAINT `tentDateTurnUnique` UNIQUE(`tentId`,`logDate`,`turn`)
);
--> statement-breakpoint
CREATE TABLE `recipeTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') NOT NULL,
	`weekNumber` int,
	`volumeTotalL` decimal(6,2),
	`ecTarget` decimal(4,2),
	`phTarget` decimal(3,1),
	`productsJson` text NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recipeTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`logDate` timestamp NOT NULL,
	`turn` enum('AM','PM') NOT NULL,
	`volumeTotalL` decimal(6,2),
	`ecTarget` decimal(4,2),
	`phTarget` decimal(3,1),
	`productsJson` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`),
	CONSTRAINT `tentDateTurnUnique` UNIQUE(`tentId`,`logDate`,`turn`)
);
--> statement-breakpoint
CREATE TABLE `safetyLimits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`context` enum('TENT_A','TENT_BC') NOT NULL,
	`phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') NOT NULL,
	`metric` enum('TEMP','RH','PPFD') NOT NULL,
	`minValue` decimal(10,2),
	`maxValue` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `safetyLimits_id` PRIMARY KEY(`id`),
	CONSTRAINT `contextPhaseMetricUnique` UNIQUE(`context`,`phase`,`metric`)
);
--> statement-breakpoint
CREATE TABLE `strains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`vegaWeeks` int NOT NULL DEFAULT 4,
	`floraWeeks` int NOT NULL DEFAULT 8,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `strains_id` PRIMARY KEY(`id`),
	CONSTRAINT `strains_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `taskInstances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`taskTemplateId` int NOT NULL,
	`occurrenceDate` timestamp NOT NULL,
	`isDone` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `taskInstances_id` PRIMARY KEY(`id`),
	CONSTRAINT `tentTaskDateUnique` UNIQUE(`tentId`,`taskTemplateId`,`occurrenceDate`)
);
--> statement-breakpoint
CREATE TABLE `taskTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`context` enum('TENT_A','TENT_BC') NOT NULL,
	`phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') NOT NULL,
	`weekNumber` int,
	`title` varchar(200) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `taskTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tentAState` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`mode` enum('MAINTENANCE','CLONING') NOT NULL DEFAULT 'MAINTENANCE',
	`activeCloningEventId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tentAState_id` PRIMARY KEY(`id`),
	CONSTRAINT `tentAState_tentId_unique` UNIQUE(`tentId`)
);
--> statement-breakpoint
CREATE TABLE `tents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`tentType` enum('A','B','C') NOT NULL,
	`width` int NOT NULL,
	`depth` int NOT NULL,
	`height` int NOT NULL,
	`volume` decimal(10,3) NOT NULL,
	`powerW` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `weeklyTargets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`strainId` int NOT NULL,
	`phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') NOT NULL,
	`weekNumber` int NOT NULL,
	`tempMin` decimal(4,1),
	`tempMax` decimal(4,1),
	`rhMin` decimal(4,1),
	`rhMax` decimal(4,1),
	`ppfdMin` int,
	`ppfdMax` int,
	`photoperiod` varchar(10),
	`phMin` decimal(3,1),
	`phMax` decimal(3,1),
	`ecMin` decimal(3,1),
	`ecMax` decimal(3,1),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weeklyTargets_id` PRIMARY KEY(`id`),
	CONSTRAINT `strainPhaseWeekUnique` UNIQUE(`strainId`,`phase`,`weekNumber`)
);
--> statement-breakpoint
ALTER TABLE `alertHistory` ADD CONSTRAINT `alertHistory_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD CONSTRAINT `alertSettings_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cloningEvents` ADD CONSTRAINT `cloningEvents_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cycles` ADD CONSTRAINT `cycles_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cycles` ADD CONSTRAINT `cycles_strainId_strains_id_fk` FOREIGN KEY (`strainId`) REFERENCES `strains`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dailyLogs` ADD CONSTRAINT `dailyLogs_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskInstances` ADD CONSTRAINT `taskInstances_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `taskInstances` ADD CONSTRAINT `taskInstances_taskTemplateId_taskTemplates_id_fk` FOREIGN KEY (`taskTemplateId`) REFERENCES `taskTemplates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tentAState` ADD CONSTRAINT `tentAState_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tentAState` ADD CONSTRAINT `tentAState_activeCloningEventId_cloningEvents_id_fk` FOREIGN KEY (`activeCloningEventId`) REFERENCES `cloningEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weeklyTargets` ADD CONSTRAINT `weeklyTargets_strainId_strains_id_fk` FOREIGN KEY (`strainId`) REFERENCES `strains`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tentIdx` ON `alertHistory` (`tentId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `alertHistory` (`createdAt`);--> statement-breakpoint
CREATE INDEX `tentIdx` ON `alerts` (`tentId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `alerts` (`status`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `alerts` (`logDate`);--> statement-breakpoint
CREATE INDEX `tentIdx` ON `cloningEvents` (`tentId`);--> statement-breakpoint
CREATE INDEX `tentIdx` ON `cycles` (`tentId`);--> statement-breakpoint
CREATE INDEX `strainIdx` ON `cycles` (`strainId`);--> statement-breakpoint
CREATE INDEX `tentIdx` ON `dailyLogs` (`tentId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `dailyLogs` (`logDate`);--> statement-breakpoint
CREATE INDEX `tentIdx` ON `recipes` (`tentId`);--> statement-breakpoint
CREATE INDEX `tentIdx` ON `taskInstances` (`tentId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `taskInstances` (`occurrenceDate`);--> statement-breakpoint
CREATE INDEX `strainIdx` ON `weeklyTargets` (`strainId`);
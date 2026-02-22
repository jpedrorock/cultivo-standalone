CREATE TABLE `alertPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`temperatureEnabled` boolean NOT NULL DEFAULT true,
	`temperatureMin` decimal(5,2) DEFAULT '18.00',
	`temperatureMax` decimal(5,2) DEFAULT '28.00',
	`humidityEnabled` boolean NOT NULL DEFAULT true,
	`humidityMin` decimal(5,2) DEFAULT '40.00',
	`humidityMax` decimal(5,2) DEFAULT '70.00',
	`phEnabled` boolean NOT NULL DEFAULT true,
	`phMin` decimal(4,2) DEFAULT '5.50',
	`phMax` decimal(4,2) DEFAULT '6.50',
	`ppfdEnabled` boolean NOT NULL DEFAULT true,
	`ppfdMin` decimal(6,2) DEFAULT '400.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fertilizationPresets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`waterVolume` decimal(10,2) NOT NULL,
	`targetEC` decimal(10,2) NOT NULL,
	`phase` enum('VEGA','FLORA'),
	`weekNumber` int,
	`irrigationsPerWeek` decimal(10,1),
	`calculationMode` enum('per-irrigation','per-week') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fertilizationPresets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tempAlertsEnabled` boolean NOT NULL DEFAULT true,
	`rhAlertsEnabled` boolean NOT NULL DEFAULT true,
	`ppfdAlertsEnabled` boolean NOT NULL DEFAULT true,
	`phAlertsEnabled` boolean NOT NULL DEFAULT true,
	`taskRemindersEnabled` boolean NOT NULL DEFAULT true,
	`dailySummaryEnabled` boolean NOT NULL DEFAULT false,
	`dailySummaryTime` varchar(5) DEFAULT '09:00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `nutrientApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`cycleId` int,
	`recipeTemplateId` int,
	`applicationDate` timestamp NOT NULL DEFAULT (now()),
	`recipeName` varchar(100) NOT NULL,
	`phase` enum('CLONING','VEGA','FLORA','MAINTENANCE','DRYING') NOT NULL,
	`weekNumber` int,
	`volumeTotalL` decimal(6,2) NOT NULL,
	`ecTarget` decimal(4,2),
	`ecActual` decimal(4,2),
	`phTarget` decimal(3,1),
	`phActual` decimal(3,1),
	`productsJson` text NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nutrientApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `phaseAlertMargins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phase` enum('MAINTENANCE','CLONING','VEGA','FLORA','DRYING') NOT NULL,
	`tempMargin` decimal(3,1) NOT NULL,
	`rhMargin` decimal(3,1) NOT NULL,
	`ppfdMargin` int NOT NULL,
	`phMargin` decimal(2,1),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `phaseAlertMargins_id` PRIMARY KEY(`id`),
	CONSTRAINT `phaseAlertMargins_phase_unique` UNIQUE(`phase`)
);
--> statement-breakpoint
CREATE TABLE `plantHealthLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`logDate` timestamp NOT NULL DEFAULT (now()),
	`healthStatus` enum('HEALTHY','STRESSED','SICK','RECOVERING') NOT NULL,
	`symptoms` text,
	`treatment` text,
	`notes` text,
	`photoUrl` varchar(500),
	`photoKey` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plantHealthLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plantLSTLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`logDate` timestamp NOT NULL DEFAULT (now()),
	`technique` varchar(100) NOT NULL,
	`beforePhotoUrl` varchar(500),
	`beforePhotoKey` varchar(500),
	`afterPhotoUrl` varchar(500),
	`afterPhotoKey` varchar(500),
	`response` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plantLSTLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plantObservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`observationDate` timestamp NOT NULL DEFAULT (now()),
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plantObservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plantPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`photoUrl` varchar(500) NOT NULL,
	`photoKey` varchar(500) NOT NULL,
	`description` text,
	`photoDate` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plantPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plantRunoffLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`logDate` timestamp NOT NULL DEFAULT (now()),
	`volumeIn` decimal(6,2) NOT NULL,
	`volumeOut` decimal(6,2) NOT NULL,
	`runoffPercent` decimal(5,2) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plantRunoffLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plantTentHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`fromTentId` int,
	`toTentId` int NOT NULL,
	`movedAt` timestamp NOT NULL DEFAULT (now()),
	`reason` text,
	CONSTRAINT `plantTentHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plantTrichomeLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plantId` int NOT NULL,
	`logDate` timestamp NOT NULL DEFAULT (now()),
	`trichomeStatus` enum('CLEAR','CLOUDY','AMBER','MIXED') NOT NULL,
	`clearPercent` int,
	`cloudyPercent` int,
	`amberPercent` int,
	`photoUrl` varchar(500),
	`photoKey` varchar(500),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plantTrichomeLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(50),
	`strainId` int NOT NULL,
	`currentTentId` int,
	`plantStage` enum('CLONE','SEEDLING','PLANT') NOT NULL DEFAULT 'SEEDLING',
	`status` enum('ACTIVE','HARVESTED','DEAD','DISCARDED') NOT NULL DEFAULT 'ACTIVE',
	`finishedAt` timestamp,
	`finishReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wateringApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tentId` int NOT NULL,
	`cycleId` int,
	`applicationDate` timestamp NOT NULL DEFAULT (now()),
	`recipeName` varchar(100) NOT NULL,
	`potSizeL` decimal(5,2) NOT NULL,
	`numberOfPots` int NOT NULL,
	`waterPerPotL` decimal(5,2) NOT NULL,
	`totalWaterL` decimal(7,2) NOT NULL,
	`targetRunoffPercent` decimal(4,1),
	`expectedRunoffL` decimal(6,2),
	`actualRunoffL` decimal(6,2),
	`actualRunoffPercent` decimal(4,1),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wateringApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wateringPresets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`plantCount` int NOT NULL,
	`potSize` decimal(10,1) NOT NULL,
	`targetRunoff` decimal(10,1) NOT NULL,
	`phase` enum('VEGA','FLORA'),
	`weekNumber` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wateringPresets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alertHistory` MODIFY COLUMN `metric` enum('TEMP','RH','PPFD','PH') NOT NULL;--> statement-breakpoint
ALTER TABLE `alerts` MODIFY COLUMN `metric` enum('TEMP','RH','PPFD','PH') NOT NULL;--> statement-breakpoint
ALTER TABLE `cycles` MODIFY COLUMN `strainId` int;--> statement-breakpoint
ALTER TABLE `recipeTemplates` MODIFY COLUMN `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE','DRYING') NOT NULL;--> statement-breakpoint
ALTER TABLE `safetyLimits` MODIFY COLUMN `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE','DRYING') NOT NULL;--> statement-breakpoint
ALTER TABLE `safetyLimits` MODIFY COLUMN `metric` enum('TEMP','RH','PPFD','PH') NOT NULL;--> statement-breakpoint
ALTER TABLE `taskTemplates` MODIFY COLUMN `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE','DRYING') NOT NULL;--> statement-breakpoint
ALTER TABLE `weeklyTargets` MODIFY COLUMN `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE','DRYING') NOT NULL;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD `phEnabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD `tempMargin` decimal(3,1) DEFAULT '2.0' NOT NULL;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD `rhMargin` decimal(3,1) DEFAULT '5.0' NOT NULL;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD `ppfdMargin` int DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD `phMargin` decimal(2,1) DEFAULT '0.2' NOT NULL;--> statement-breakpoint
ALTER TABLE `cycles` ADD `cloningStartDate` timestamp;--> statement-breakpoint
ALTER TABLE `cycles` ADD `clonesProduced` int;--> statement-breakpoint
ALTER TABLE `cycles` ADD `harvestWeight` decimal(10,2);--> statement-breakpoint
ALTER TABLE `cycles` ADD `harvestNotes` text;--> statement-breakpoint
ALTER TABLE `dailyLogs` ADD `wateringVolume` int;--> statement-breakpoint
ALTER TABLE `dailyLogs` ADD `runoffCollected` int;--> statement-breakpoint
ALTER TABLE `dailyLogs` ADD `runoffPercentage` decimal(5,2);--> statement-breakpoint
ALTER TABLE `tents` ADD `category` enum('MAINTENANCE','VEGA','FLORA','DRYING') NOT NULL;--> statement-breakpoint
ALTER TABLE `tents` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `alertSettings` ADD CONSTRAINT `alertSettings_tentId_unique` UNIQUE(`tentId`);--> statement-breakpoint
ALTER TABLE `plantHealthLogs` ADD CONSTRAINT `plantHealthLogs_plantId_plants_id_fk` FOREIGN KEY (`plantId`) REFERENCES `plants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantLSTLogs` ADD CONSTRAINT `plantLSTLogs_plantId_plants_id_fk` FOREIGN KEY (`plantId`) REFERENCES `plants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantObservations` ADD CONSTRAINT `plantObservations_plantId_plants_id_fk` FOREIGN KEY (`plantId`) REFERENCES `plants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantPhotos` ADD CONSTRAINT `plantPhotos_plantId_plants_id_fk` FOREIGN KEY (`plantId`) REFERENCES `plants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantRunoffLogs` ADD CONSTRAINT `plantRunoffLogs_plantId_plants_id_fk` FOREIGN KEY (`plantId`) REFERENCES `plants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantTentHistory` ADD CONSTRAINT `plantTentHistory_plantId_plants_id_fk` FOREIGN KEY (`plantId`) REFERENCES `plants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantTentHistory` ADD CONSTRAINT `plantTentHistory_fromTentId_tents_id_fk` FOREIGN KEY (`fromTentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantTentHistory` ADD CONSTRAINT `plantTentHistory_toTentId_tents_id_fk` FOREIGN KEY (`toTentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plantTrichomeLogs` ADD CONSTRAINT `plantTrichomeLogs_plantId_plants_id_fk` FOREIGN KEY (`plantId`) REFERENCES `plants`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plants` ADD CONSTRAINT `plants_strainId_strains_id_fk` FOREIGN KEY (`strainId`) REFERENCES `strains`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plants` ADD CONSTRAINT `plants_currentTentId_tents_id_fk` FOREIGN KEY (`currentTentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tentId_idx` ON `nutrientApplications` (`tentId`);--> statement-breakpoint
CREATE INDEX `cycleId_idx` ON `nutrientApplications` (`cycleId`);--> statement-breakpoint
CREATE INDEX `applicationDate_idx` ON `nutrientApplications` (`applicationDate`);--> statement-breakpoint
CREATE INDEX `plantIdx` ON `plantHealthLogs` (`plantId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `plantHealthLogs` (`logDate`);--> statement-breakpoint
CREATE INDEX `plantIdx` ON `plantLSTLogs` (`plantId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `plantLSTLogs` (`logDate`);--> statement-breakpoint
CREATE INDEX `plantIdx` ON `plantObservations` (`plantId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `plantObservations` (`observationDate`);--> statement-breakpoint
CREATE INDEX `plantIdx` ON `plantPhotos` (`plantId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `plantPhotos` (`photoDate`);--> statement-breakpoint
CREATE INDEX `plantIdx` ON `plantRunoffLogs` (`plantId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `plantRunoffLogs` (`logDate`);--> statement-breakpoint
CREATE INDEX `plantIdx` ON `plantTentHistory` (`plantId`);--> statement-breakpoint
CREATE INDEX `plantIdx` ON `plantTrichomeLogs` (`plantId`);--> statement-breakpoint
CREATE INDEX `dateIdx` ON `plantTrichomeLogs` (`logDate`);--> statement-breakpoint
CREATE INDEX `strainIdx` ON `plants` (`strainId`);--> statement-breakpoint
CREATE INDEX `tentIdx` ON `plants` (`currentTentId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `plants` (`status`);--> statement-breakpoint
CREATE INDEX `stageIdx` ON `plants` (`plantStage`);--> statement-breakpoint
CREATE INDEX `tentId_idx` ON `wateringApplications` (`tentId`);--> statement-breakpoint
CREATE INDEX `cycleId_idx` ON `wateringApplications` (`cycleId`);--> statement-breakpoint
CREATE INDEX `applicationDate_idx` ON `wateringApplications` (`applicationDate`);--> statement-breakpoint
ALTER TABLE `tents` DROP COLUMN `tentType`;
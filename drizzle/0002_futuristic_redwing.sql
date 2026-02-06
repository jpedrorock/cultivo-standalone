ALTER TABLE `weeklyTargets` DROP INDEX `tentPhaseWeekUnique`;--> statement-breakpoint
ALTER TABLE `weeklyTargets` DROP FOREIGN KEY `weeklyTargets_tentId_tents_id_fk`;
--> statement-breakpoint
DROP INDEX `tentIdx` ON `weeklyTargets`;--> statement-breakpoint
ALTER TABLE `weeklyTargets` ADD `strainId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `weeklyTargets` ADD CONSTRAINT `strainPhaseWeekUnique` UNIQUE(`strainId`,`phase`,`weekNumber`);--> statement-breakpoint
ALTER TABLE `weeklyTargets` ADD CONSTRAINT `weeklyTargets_strainId_strains_id_fk` FOREIGN KEY (`strainId`) REFERENCES `strains`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `strainIdx` ON `weeklyTargets` (`strainId`);--> statement-breakpoint
ALTER TABLE `weeklyTargets` DROP COLUMN `tentId`;
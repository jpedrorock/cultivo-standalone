ALTER TABLE `weeklyTargets` DROP INDEX `strainPhaseWeekUnique`;--> statement-breakpoint
ALTER TABLE `weeklyTargets` DROP FOREIGN KEY `weeklyTargets_strainId_strains_id_fk`;
--> statement-breakpoint
DROP INDEX `strainIdx` ON `weeklyTargets`;--> statement-breakpoint
ALTER TABLE `weeklyTargets` ADD `tentId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `weeklyTargets` ADD CONSTRAINT `tentPhaseWeekUnique` UNIQUE(`tentId`,`phase`,`weekNumber`);--> statement-breakpoint
ALTER TABLE `weeklyTargets` ADD CONSTRAINT `weeklyTargets_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tentIdx` ON `weeklyTargets` (`tentId`);--> statement-breakpoint
ALTER TABLE `weeklyTargets` DROP COLUMN `strainId`;
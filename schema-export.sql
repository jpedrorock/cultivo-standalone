[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops
-- Schema exportado do banco Manus
-- Gerado em: 2026-02-07T19:38:45.374Z

CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hash` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=611227;

CREATE TABLE `alertHistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `metric` enum('TEMP','RH','PPFD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `targetMin` decimal(10,2) DEFAULT NULL,
  `targetMax` decimal(10,2) DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notificationSent` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `tentIdx` (`tentId`),
  KEY `dateIdx` (`createdAt`),
  CONSTRAINT `fk_1` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alertSettings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `alertsEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `tempEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `rhEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `ppfdEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`tentId`),
  CONSTRAINT `fk_1` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `alertType` enum('OUT_OF_RANGE','SAFETY_LIMIT','TREND') COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric` enum('TEMP','RH','PPFD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `logDate` timestamp NOT NULL,
  `turn` enum('AM','PM') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `value` decimal(10,2) DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('NEW','SEEN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEW',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `alerts_tentId_tents_id_fk` (`tentId`),
  KEY `tentIdx` (`tentId`),
  KEY `statusIdx` (`status`),
  KEY `dateIdx` (`logDate`),
  CONSTRAINT `alerts_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `calculationHistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `calculatorType` enum('IRRIGATION','FERTILIZATION','LUX_PPFD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `parametersJson` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `resultJson` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `calculationHistory_userId_users_id_fk` (`userId`),
  KEY `userIdx` (`userId`),
  KEY `typeIdx` (`calculatorType`),
  KEY `dateIdx` (`createdAt`),
  CONSTRAINT `calculationHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

CREATE TABLE `cloningEvents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `startDate` timestamp NOT NULL,
  `endDate` timestamp NOT NULL,
  `status` enum('ACTIVE','FINISHED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `cloningEvents_tentId_tents_id_fk` (`tentId`),
  KEY `tentIdx` (`tentId`),
  CONSTRAINT `cloningEvents_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cycles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `strainId` int(11) NOT NULL,
  `startDate` timestamp NOT NULL,
  `floraStartDate` timestamp NULL DEFAULT NULL,
  `status` enum('ACTIVE','FINISHED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `cycles_tentId_tents_id_fk` (`tentId`),
  KEY `cycles_strainId_strains_id_fk` (`strainId`),
  KEY `tentIdx` (`tentId`),
  KEY `strainIdx` (`strainId`),
  CONSTRAINT `cycles_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `cycles_strainId_strains_id_fk` FOREIGN KEY (`strainId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`strains` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=150001;

CREATE TABLE `dailyLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `logDate` timestamp NOT NULL,
  `turn` enum('AM','PM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tempC` decimal(4,1) DEFAULT NULL,
  `rhPct` decimal(4,1) DEFAULT NULL,
  `ppfd` int(11) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ph` decimal(3,1) DEFAULT NULL,
  `ec` decimal(4,2) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tentDateTurnUnique` (`tentId`,`logDate`,`turn`),
  KEY `tentIdx` (`tentId`),
  KEY `dateIdx` (`logDate`),
  CONSTRAINT `dailyLogs_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=60001;

CREATE TABLE `recipeTemplates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weekNumber` int(11) DEFAULT NULL,
  `volumeTotalL` decimal(6,2) DEFAULT NULL,
  `ecTarget` decimal(4,2) DEFAULT NULL,
  `phTarget` decimal(3,1) DEFAULT NULL,
  `productsJson` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `recipes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `logDate` timestamp NOT NULL,
  `turn` enum('AM','PM') COLLATE utf8mb4_unicode_ci NOT NULL,
  `volumeTotalL` decimal(6,2) DEFAULT NULL,
  `ecTarget` decimal(4,2) DEFAULT NULL,
  `phTarget` decimal(3,1) DEFAULT NULL,
  `productsJson` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tentDateTurnUnique` (`tentId`,`logDate`,`turn`),
  KEY `tentIdx` (`tentId`),
  CONSTRAINT `recipes_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `safetyLimits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `context` enum('TENT_A','TENT_BC') COLLATE utf8mb4_unicode_ci NOT NULL,
  `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric` enum('TEMP','RH','PPFD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `minValue` decimal(10,2) DEFAULT NULL,
  `maxValue` decimal(10,2) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `contextPhaseMetricUnique` (`context`,`phase`,`metric`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

CREATE TABLE `strains` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vegaWeeks` int(11) NOT NULL DEFAULT '4',
  `floraWeeks` int(11) NOT NULL DEFAULT '8',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `strains_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=120001;

CREATE TABLE `taskInstances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `taskTemplateId` int(11) NOT NULL,
  `occurrenceDate` timestamp NOT NULL,
  `isDone` tinyint(1) NOT NULL DEFAULT '0',
  `completedAt` timestamp NULL DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tentTaskDateUnique` (`tentId`,`taskTemplateId`,`occurrenceDate`),
  KEY `taskInstances_taskTemplateId_taskTemplates_id_fk` (`taskTemplateId`),
  KEY `tentIdx` (`tentId`),
  KEY `dateIdx` (`occurrenceDate`),
  CONSTRAINT `taskInstances_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `taskInstances_taskTemplateId_taskTemplates_id_fk` FOREIGN KEY (`taskTemplateId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`taskTemplates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=180001;

CREATE TABLE `taskTemplates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `context` enum('TENT_A','TENT_BC') COLLATE utf8mb4_unicode_ci NOT NULL,
  `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weekNumber` int(11) DEFAULT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=60001;

CREATE TABLE `tentAState` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tentId` int(11) NOT NULL,
  `mode` enum('MAINTENANCE','CLONING') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MAINTENANCE',
  `activeCloningEventId` int(11) DEFAULT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tentAState_tentId_unique` (`tentId`),
  KEY `tentAState_activeCloningEventId_cloningEvents_id_fk` (`activeCloningEventId`),
  CONSTRAINT `tentAState_tentId_tents_id_fk` FOREIGN KEY (`tentId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`tents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `tentAState_activeCloningEventId_cloningEvents_id_fk` FOREIGN KEY (`activeCloningEventId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`cloningEvents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

CREATE TABLE `tents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tentType` enum('A','B','C') COLLATE utf8mb4_unicode_ci NOT NULL,
  `width` int(11) NOT NULL,
  `depth` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `volume` decimal(10,3) NOT NULL,
  `powerW` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=90001;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `openId` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(320) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `loginMethod` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=510001;

CREATE TABLE `weeklyTargets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phase` enum('CLONING','VEGA','FLORA','MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `weekNumber` int(11) NOT NULL,
  `tempMin` decimal(4,1) DEFAULT NULL,
  `tempMax` decimal(4,1) DEFAULT NULL,
  `rhMin` decimal(4,1) DEFAULT NULL,
  `rhMax` decimal(4,1) DEFAULT NULL,
  `ppfdMin` int(11) DEFAULT NULL,
  `ppfdMax` int(11) DEFAULT NULL,
  `photoperiod` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phMin` decimal(3,1) DEFAULT NULL,
  `phMax` decimal(3,1) DEFAULT NULL,
  `ecMin` decimal(3,1) DEFAULT NULL,
  `ecMax` decimal(3,1) DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `strainId` int(11) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `strainPhaseWeekUnique` (`strainId`,`phase`,`weekNumber`),
  KEY `strainIdx` (`strainId`),
  CONSTRAINT `weeklyTargets_strainId_strains_id_fk` FOREIGN KEY (`strainId`) REFERENCES `AhyBXV9CDav4cSFRqphBxc`.`strains` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=60001;


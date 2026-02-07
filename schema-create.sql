-- App Cultivo - MySQL Schema
-- Generated from drizzle/schema.ts

SET FOREIGN_KEY_CHECKS=0;

-- Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `openId` VARCHAR(64) NOT NULL UNIQUE,
  `name` TEXT,
  `email` VARCHAR(320),
  `loginMethod` VARCHAR(64),
  `role` ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  `lastSignedIn` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tents table (Estufas)
CREATE TABLE IF NOT EXISTS `tents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `tentType` ENUM('A', 'B', 'C') NOT NULL,
  `width` INT NOT NULL,
  `depth` INT NOT NULL,
  `height` INT NOT NULL,
  `volume` DECIMAL(10,3) NOT NULL,
  `powerW` INT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Strains table (Variedades genéticas)
CREATE TABLE IF NOT EXISTS `strains` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `vegaWeeks` INT DEFAULT 4 NOT NULL,
  `floraWeeks` INT DEFAULT 8 NOT NULL,
  `isActive` BOOLEAN DEFAULT TRUE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cycles table (Ciclos ativos)
CREATE TABLE IF NOT EXISTS `cycles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL,
  `strainId` INT NOT NULL,
  `startDate` TIMESTAMP NOT NULL,
  `floraStartDate` TIMESTAMP,
  `status` ENUM('ACTIVE', 'FINISHED') DEFAULT 'ACTIVE' NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`),
  FOREIGN KEY (`strainId`) REFERENCES `strains`(`id`),
  INDEX `tentIdx` (`tentId`),
  INDEX `strainIdx` (`strainId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cloning Events table
CREATE TABLE IF NOT EXISTS `cloningEvents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL,
  `startDate` TIMESTAMP NOT NULL,
  `endDate` TIMESTAMP NOT NULL,
  `status` ENUM('ACTIVE', 'FINISHED') DEFAULT 'ACTIVE' NOT NULL,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`),
  INDEX `tentIdx` (`tentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tent A State table
CREATE TABLE IF NOT EXISTS `tentAState` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL UNIQUE,
  `mode` ENUM('MAINTENANCE', 'CLONING') DEFAULT 'MAINTENANCE' NOT NULL,
  `activeCloningEventId` INT,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`),
  FOREIGN KEY (`activeCloningEventId`) REFERENCES `cloningEvents`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weekly Targets table
CREATE TABLE IF NOT EXISTS `weeklyTargets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `strainId` INT NOT NULL,
  `phase` ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE') NOT NULL,
  `weekNumber` INT NOT NULL,
  `tempMin` DECIMAL(4,1),
  `tempMax` DECIMAL(4,1),
  `rhMin` DECIMAL(4,1),
  `rhMax` DECIMAL(4,1),
  `ppfdMin` INT,
  `ppfdMax` INT,
  `photoperiod` VARCHAR(10),
  `phMin` DECIMAL(3,1),
  `phMax` DECIMAL(3,1),
  `ecMin` DECIMAL(3,1),
  `ecMax` DECIMAL(3,1),
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`strainId`) REFERENCES `strains`(`id`),
  UNIQUE KEY `strainPhaseWeekUnique` (`strainId`, `phase`, `weekNumber`),
  INDEX `strainIdx` (`strainId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily Logs table
CREATE TABLE IF NOT EXISTS `dailyLogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL,
  `logDate` TIMESTAMP NOT NULL,
  `turn` ENUM('AM', 'PM') NOT NULL,
  `tempC` DECIMAL(4,1),
  `rhPct` DECIMAL(4,1),
  `ppfd` INT,
  `ph` DECIMAL(3,1),
  `ec` DECIMAL(4,2),
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`),
  UNIQUE KEY `tentDateTurnUnique` (`tentId`, `logDate`, `turn`),
  INDEX `tentIdx` (`tentId`),
  INDEX `dateIdx` (`logDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipes table
CREATE TABLE IF NOT EXISTS `recipes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL,
  `logDate` TIMESTAMP NOT NULL,
  `turn` ENUM('AM', 'PM') NOT NULL,
  `volumeTotalL` DECIMAL(6,2),
  `ecTarget` DECIMAL(4,2),
  `phTarget` DECIMAL(3,1),
  `productsJson` TEXT,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`),
  UNIQUE KEY `tentDateTurnUnique` (`tentId`, `logDate`, `turn`),
  INDEX `tentIdx` (`tentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Recipe Templates table
CREATE TABLE IF NOT EXISTS `recipeTemplates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phase` ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE') NOT NULL,
  `weekNumber` INT,
  `volumeTotalL` DECIMAL(6,2),
  `ecTarget` DECIMAL(4,2),
  `phTarget` DECIMAL(3,1),
  `productsJson` TEXT NOT NULL,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Templates table
CREATE TABLE IF NOT EXISTS `taskTemplates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `context` ENUM('TENT_A', 'TENT_BC') NOT NULL,
  `phase` ENUM('CLONING', 'VEGA', 'FLORA', 'MAINTENANCE') NOT NULL,
  `weekNumber` INT,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Task Instances table
CREATE TABLE IF NOT EXISTS `taskInstances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL,
  `taskTemplateId` INT NOT NULL,
  `occurrenceDate` TIMESTAMP NOT NULL,
  `isDone` BOOLEAN DEFAULT FALSE NOT NULL,
  `completedAt` TIMESTAMP,
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`),
  FOREIGN KEY (`taskTemplateId`) REFERENCES `taskTemplates`(`id`),
  UNIQUE KEY `tentTaskDateUnique` (`tentId`, `taskTemplateId`, `occurrenceDate`),
  INDEX `tentIdx` (`tentId`),
  INDEX `dateIdx` (`occurrenceDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alerts table
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL,
  `alertType` ENUM('TEMP_HIGH', 'TEMP_LOW', 'RH_HIGH', 'RH_LOW', 'PPFD_HIGH', 'PPFD_LOW', 'PH_HIGH', 'PH_LOW', 'EC_HIGH', 'EC_LOW') NOT NULL,
  `severity` ENUM('INFO', 'WARNING', 'CRITICAL') DEFAULT 'WARNING' NOT NULL,
  `message` TEXT NOT NULL,
  `value` DECIMAL(6,2),
  `threshold` DECIMAL(6,2),
  `isActive` BOOLEAN DEFAULT TRUE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `resolvedAt` TIMESTAMP,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`),
  INDEX `tentIdx` (`tentId`),
  INDEX `activeIdx` (`isActive`),
  INDEX `createdIdx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alert Settings table
CREATE TABLE IF NOT EXISTS `alertSettings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tentId` INT NOT NULL,
  `alertType` ENUM('TEMP_HIGH', 'TEMP_LOW', 'RH_HIGH', 'RH_LOW', 'PPFD_HIGH', 'PPFD_LOW', 'PH_HIGH', 'PH_LOW', 'EC_HIGH', 'EC_LOW') NOT NULL,
  `isEnabled` BOOLEAN DEFAULT TRUE NOT NULL,
  `threshold` DECIMAL(6,2) NOT NULL,
  `notifyEmail` BOOLEAN DEFAULT FALSE NOT NULL,
  `notifySMS` BOOLEAN DEFAULT FALSE NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alert History table
CREATE TABLE IF NOT EXISTS `alertHistory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `alertId` INT NOT NULL,
  `action` ENUM('CREATED', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED') NOT NULL,
  `performedBy` VARCHAR(100),
  `notes` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`alertId`) REFERENCES `alerts`(`id`),
  INDEX `alertIdx` (`alertId`),
  INDEX `createdIdx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Safety Limits table
CREATE TABLE IF NOT EXISTS `safetyLimits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parameter` ENUM('TEMP', 'RH', 'PPFD', 'PH', 'EC') NOT NULL UNIQUE,
  `minValue` DECIMAL(6,2) NOT NULL,
  `maxValue` DECIMAL(6,2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `description` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;

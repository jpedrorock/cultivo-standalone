-- Migração: Adicionar ON DELETE CASCADE (Versão Robusta)
-- Esta versão descobre automaticamente os nomes das foreign keys

SET FOREIGN_KEY_CHECKS=0;

-- Função helper: Recriar FK com CASCADE
-- Para cada tabela, vamos dropar e recriar as FKs com ON DELETE CASCADE

-- 1. cycles → tents (tentId)
ALTER TABLE `cycles` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cycles'
    AND COLUMN_NAME = 'tentId'
    AND REFERENCED_TABLE_NAME = 'tents'
  LIMIT 1
);
ALTER TABLE `cycles` 
  ADD CONSTRAINT `cycles_tentId_fk` 
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE CASCADE;

-- 2. cycles → strains (strainId)
ALTER TABLE `cycles` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'cycles'
    AND COLUMN_NAME = 'strainId'
    AND REFERENCED_TABLE_NAME = 'strains'
  LIMIT 1
);
ALTER TABLE `cycles` 
  ADD CONSTRAINT `cycles_strainId_fk` 
  FOREIGN KEY (`strainId`) REFERENCES `strains`(`id`) ON DELETE CASCADE;

-- 3. dailyLogs → tents (tentId)
ALTER TABLE `dailyLogs` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'dailyLogs'
    AND COLUMN_NAME = 'tentId'
    AND REFERENCED_TABLE_NAME = 'tents'
  LIMIT 1
);
ALTER TABLE `dailyLogs` 
  ADD CONSTRAINT `dailyLogs_tentId_fk` 
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE CASCADE;

-- 4. weeklyTargets → cycles (cycleId)
ALTER TABLE `weeklyTargets` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'weeklyTargets'
    AND COLUMN_NAME = 'cycleId'
    AND REFERENCED_TABLE_NAME = 'cycles'
  LIMIT 1
);
ALTER TABLE `weeklyTargets` 
  ADD CONSTRAINT `weeklyTargets_cycleId_fk` 
  FOREIGN KEY (`cycleId`) REFERENCES `cycles`(`id`) ON DELETE CASCADE;

-- 5. tasks → tents (tentId)
ALTER TABLE `tasks` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tasks'
    AND COLUMN_NAME = 'tentId'
    AND REFERENCED_TABLE_NAME = 'tents'
  LIMIT 1
);
ALTER TABLE `tasks` 
  ADD CONSTRAINT `tasks_tentId_fk` 
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE CASCADE;

-- 6. taskInstances → tasks (taskId)
ALTER TABLE `taskInstances` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'taskInstances'
    AND COLUMN_NAME = 'taskId'
    AND REFERENCED_TABLE_NAME = 'tasks'
  LIMIT 1
);
ALTER TABLE `taskInstances` 
  ADD CONSTRAINT `taskInstances_taskId_fk` 
  FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE CASCADE;

-- 7. alerts → tents (tentId)
ALTER TABLE `alerts` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alerts'
    AND COLUMN_NAME = 'tentId'
    AND REFERENCED_TABLE_NAME = 'tents'
  LIMIT 1
);
ALTER TABLE `alerts` 
  ADD CONSTRAINT `alerts_tentId_fk` 
  FOREIGN KEY (`tentId`) REFERENCES `tents`(`id`) ON DELETE CASCADE;

-- 8. alertHistory → alerts (alertId)
ALTER TABLE `alertHistory` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'alertHistory'
    AND COLUMN_NAME = 'alertId'
    AND REFERENCED_TABLE_NAME = 'alerts'
  LIMIT 1
);
ALTER TABLE `alertHistory` 
  ADD CONSTRAINT `alertHistory_alertId_fk` 
  FOREIGN KEY (`alertId`) REFERENCES `alerts`(`id`) ON DELETE CASCADE;

-- 9. nutrientLogs → cycles (cycleId)
ALTER TABLE `nutrientLogs` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'nutrientLogs'
    AND COLUMN_NAME = 'cycleId'
    AND REFERENCED_TABLE_NAME = 'cycles'
  LIMIT 1
);
ALTER TABLE `nutrientLogs` 
  ADD CONSTRAINT `nutrientLogs_cycleId_fk` 
  FOREIGN KEY (`cycleId`) REFERENCES `cycles`(`id`) ON DELETE CASCADE;

-- 10. harvestLogs → cycles (cycleId)
ALTER TABLE `harvestLogs` DROP FOREIGN KEY (
  SELECT CONSTRAINT_NAME 
  FROM information_schema.KEY_COLUMN_USAGE 
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'harvestLogs'
    AND COLUMN_NAME = 'cycleId'
    AND REFERENCED_TABLE_NAME = 'cycles'
  LIMIT 1
);
ALTER TABLE `harvestLogs` 
  ADD CONSTRAINT `harvestLogs_cycleId_fk` 
  FOREIGN KEY (`cycleId`) REFERENCES `cycles`(`id`) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;

SELECT 'Migração concluída! ON DELETE CASCADE adicionado a todas as foreign keys.' AS status;

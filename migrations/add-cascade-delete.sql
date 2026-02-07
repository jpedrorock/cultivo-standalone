-- ============================================
-- Migração: Adicionar ON DELETE CASCADE
-- ============================================
-- Este script adiciona ON DELETE CASCADE nas foreign keys
-- para permitir exclusão em cascata de estufas e dados relacionados

SET FOREIGN_KEY_CHECKS=0;

-- 1. Cycles: tentId e strainId
ALTER TABLE cycles 
  DROP FOREIGN KEY cycles_tentId_tents_id_fk,
  ADD CONSTRAINT cycles_tentId_tents_id_fk 
    FOREIGN KEY (tentId) REFERENCES tents(id) ON DELETE CASCADE;

ALTER TABLE cycles 
  DROP FOREIGN KEY cycles_strainId_strains_id_fk,
  ADD CONSTRAINT cycles_strainId_strains_id_fk 
    FOREIGN KEY (strainId) REFERENCES strains(id) ON DELETE CASCADE;

-- 2. Daily logs: tentId
ALTER TABLE dailyLogs 
  DROP FOREIGN KEY dailyLogs_tentId_tents_id_fk,
  ADD CONSTRAINT dailyLogs_tentId_tents_id_fk 
    FOREIGN KEY (tentId) REFERENCES tents(id) ON DELETE CASCADE;

-- 3. Weekly targets: cycleId
ALTER TABLE weeklyTargets 
  DROP FOREIGN KEY weeklyTargets_cycleId_cycles_id_fk,
  ADD CONSTRAINT weeklyTargets_cycleId_cycles_id_fk 
    FOREIGN KEY (cycleId) REFERENCES cycles(id) ON DELETE CASCADE;

-- 4. Tasks: tentId
ALTER TABLE tasks 
  DROP FOREIGN KEY tasks_tentId_tents_id_fk,
  ADD CONSTRAINT tasks_tentId_tents_id_fk 
    FOREIGN KEY (tentId) REFERENCES tents(id) ON DELETE CASCADE;

-- 5. Task instances: taskId
ALTER TABLE taskInstances 
  DROP FOREIGN KEY taskInstances_taskId_tasks_id_fk,
  ADD CONSTRAINT taskInstances_taskId_tasks_id_fk 
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE;

-- 6. Alerts: tentId
ALTER TABLE alerts 
  DROP FOREIGN KEY alerts_tentId_tents_id_fk,
  ADD CONSTRAINT alerts_tentId_tents_id_fk 
    FOREIGN KEY (tentId) REFERENCES tents(id) ON DELETE CASCADE;

-- 7. Alert history: alertId
ALTER TABLE alertHistory 
  DROP FOREIGN KEY alertHistory_alertId_alerts_id_fk,
  ADD CONSTRAINT alertHistory_alertId_alerts_id_fk 
    FOREIGN KEY (alertId) REFERENCES alerts(id) ON DELETE CASCADE;

-- 8. Nutrient logs: cycleId
ALTER TABLE nutrientLogs 
  DROP FOREIGN KEY nutrientLogs_cycleId_cycles_id_fk,
  ADD CONSTRAINT nutrientLogs_cycleId_cycles_id_fk 
    FOREIGN KEY (cycleId) REFERENCES cycles(id) ON DELETE CASCADE;

-- 9. Harvest logs: cycleId
ALTER TABLE harvestLogs 
  DROP FOREIGN KEY harvestLogs_cycleId_cycles_id_fk,
  ADD CONSTRAINT harvestLogs_cycleId_cycles_id_fk 
    FOREIGN KEY (cycleId) REFERENCES cycles(id) ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;

-- Verificar constraints atualizadas
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME,
  DELETE_RULE
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

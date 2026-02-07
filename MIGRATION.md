# Migração: Adicionar ON DELETE CASCADE

Se você já instalou uma versão anterior (v2.0.0, v2.0.1 ou v2.0.2) e está tendo problemas ao excluir estufas, execute esta migração para adicionar ON DELETE CASCADE nas foreign keys.

## Problema

Erro ao tentar excluir estufa:
```
Failed query: delete from `alertHistory` where `alertHistory`.`tentId` = ?
```

## Solução

Execute o script de migração automatizado:

```bash
bash migrations/apply-cascade.sh
```

O script vai:
1. Pedir suas credenciais MySQL
2. Descobrir automaticamente os nomes das foreign keys
3. Recriar cada FK com ON DELETE CASCADE
4. Mostrar o resultado final

**Alternativa manual** (se preferir):
```bash
mysql -u root -p cultivo_local < migrations/add-cascade-delete.sql
```

## O que a migração faz

Adiciona `ON DELETE CASCADE` em 9 foreign keys:

1. **cycles** → tents (tentId)
2. **cycles** → strains (strainId)
3. **dailyLogs** → tents (tentId)
4. **weeklyTargets** → cycles (cycleId)
5. **tasks** → tents (tentId)
6. **taskInstances** → tasks (taskId)
7. **alerts** → tents (tentId)
8. **alertHistory** → alerts (alertId)
9. **nutrientLogs** → cycles (cycleId)
10. **harvestLogs** → cycles (cycleId)

Agora quando você excluir uma estufa, todos os registros relacionados (ciclos, logs, tarefas, alertas) serão deletados automaticamente.

## Verificar se funcionou

Após executar a migração, você pode verificar se as constraints foram atualizadas:

```sql
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  DELETE_RULE
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'cultivo_local'
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
```

Todas as foreign keys devem mostrar `DELETE_RULE = 'CASCADE'`.

## Novas instalações

Se você está instalando pela primeira vez a partir da v2.0.3, não precisa executar esta migração. O schema já vem com ON DELETE CASCADE configurado.

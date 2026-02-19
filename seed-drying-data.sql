-- Weekly Targets para fase DRYING (2 semanas)
-- Baseado em pesquisa: temp 18-20°C, RH 55-60%, ambiente escuro (PPFD=0)

INSERT INTO weekly_targets (phase, week_number, temp_min, temp_max, rh_min, rh_max, ppfd_min, ppfd_max, ph_min, ph_max)
VALUES
  -- Semana 1 de Secagem
  ('DRYING', 1, 18, 20, 55, 60, 0, 0, NULL, NULL),
  
  -- Semana 2 de Secagem  
  ('DRYING', 2, 18, 20, 55, 60, 0, 0, NULL, NULL);

-- Task Templates para fase DRYING
-- Tarefas baseadas em melhores práticas de secagem

INSERT INTO task_templates (phase, week_number, title, description, frequency)
VALUES
  -- Semana 1
  ('DRYING', 1, 'Verificar temperatura e umidade', 'Usar higrômetro digital para confirmar que temperatura está entre 18-20°C e umidade entre 55-60%', 'DAILY'),
  ('DRYING', 1, 'Verificar sinais de mofo', 'Inspecionar buds visualmente procurando manchas brancas/cinzas ou cheiro de amônia', 'DAILY'),
  ('DRYING', 1, 'Testar prontidão dos caules', 'Dobrar caules pequenos para ver se estalam (pronto) ou flexionam (continuar secando)', 'EVERY_2_DAYS'),
  ('DRYING', 1, 'Ajustar ventilação se necessário', 'Verificar se ventilação está adequada (circulação indireta, sem apontar direto nos buds)', 'EVERY_3_DAYS'),
  ('DRYING', 1, 'Rotacionar buds (se usando rack plano)', 'Se estiver usando rack plano para wet trim, rotacionar buds para secagem uniforme', 'EVERY_3_DAYS'),
  ('DRYING', 1, 'Confirmar ambiente escuro', 'Garantir que ambiente está 100% escuro (sem exposição à luz)', 'WEEKLY'),
  
  -- Semana 2
  ('DRYING', 2, 'Verificar temperatura e umidade', 'Usar higrômetro digital para confirmar que temperatura está entre 18-20°C e umidade entre 55-60%', 'DAILY'),
  ('DRYING', 2, 'Verificar sinais de mofo', 'Inspecionar buds visualmente procurando manchas brancas/cinzas ou cheiro de amônia', 'DAILY'),
  ('DRYING', 2, 'Testar prontidão dos caules', 'Dobrar caules pequenos para ver se estalam (pronto) ou flexionam (continuar secando)', 'DAILY'),
  ('DRYING', 2, 'Preparar potes de vidro herméticos', 'Limpar e preparar potes de vidro herméticos para iniciar fase de cura', 'ONCE'),
  ('DRYING', 2, 'Avaliar prontidão para cura', 'Verificar se buds estão prontos: caules estalam, exterior seco mas não quebradiço', 'EVERY_2_DAYS'),
  ('DRYING', 2, 'Transferir buds secos para potes', 'Quando prontos, transferir buds para potes de vidro herméticos e iniciar cura', 'ONCE'),
  ('DRYING', 2, 'Iniciar processo de burping', 'Abrir potes 1-2x por dia por alguns minutos para liberar umidade (primeiros 10 dias de cura)', 'DAILY');

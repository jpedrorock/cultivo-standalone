-- Popular taskTemplates para todas as 17 semanas de cultivo
-- CLONING (2 semanas), MAINTENANCE (1 semana), VEGA (6 semanas), FLORA (8 semanas)

-- Limpar taskTemplates existentes
DELETE FROM taskTemplates;

-- ========================================
-- CLONING - Semana 1 (Estufa A)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('CLONING', 1, 'Preparar meio de enraizamento', 'Preparar cubos de lã de rocha ou jiffy pellets, pH ajustado para 5.5-6.0', 1),
('CLONING', 1, 'Selecionar plantas-mãe', 'Escolher plantas saudáveis e vigorosas para retirada de clones', 1),
('CLONING', 1, 'Cortar e preparar clones', 'Fazer cortes em 45° com lâmina esterilizada, aplicar hormônio enraizador', 1),
('CLONING', 1, 'Configurar dome de propagação', 'Umidade 80-90%, temperatura 22-24°C, luz suave (100-200 PPFD)', 1),
('CLONING', 1, 'Borrifar clones 2x ao dia', 'Manter alta umidade borrifando água pH ajustado', 1);

-- ========================================
-- CLONING - Semana 2 (Estufa A)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('CLONING', 2, 'Monitorar enraizamento', 'Verificar aparecimento de raízes brancas nos cubos', 1),
('CLONING', 2, 'Reduzir umidade gradualmente', 'Abrir dome progressivamente, reduzir para 70-80%', 1),
('CLONING', 2, 'Aumentar intensidade de luz', 'Elevar PPFD para 200-300 µmol/m²/s gradualmente', 1),
('CLONING', 2, 'Remover clones não enraizados', 'Descartar clones que não desenvolveram raízes após 10-14 dias', 1),
('CLONING', 2, 'Preparar para transplante', 'Clones com 2-3cm de raízes estão prontos para vasos', 1);

-- ========================================
-- MAINTENANCE - Semana 1 (Estufa A)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('MAINTENANCE', 1, 'Manter plantas-mãe saudáveis', 'Podar regularmente, manter em estado vegetativo', 1),
('MAINTENANCE', 1, 'Aplicar nutrientes vegetativos', 'NPK balanceado, EC 1.2-1.6 mS/cm', 1),
('MAINTENANCE', 1, 'Controlar altura das plantas', 'Técnicas de LST (Low Stress Training) se necessário', 1),
('MAINTENANCE', 1, 'Inspecionar pragas e doenças', 'Verificar folhas, caules e solo semanalmente', 1),
('MAINTENANCE', 1, 'Limpar e desinfetar área', 'Manter ambiente limpo para prevenir contaminação', 1);

-- ========================================
-- VEGA - Semana 1 (Estufa B)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('VEGA', 1, 'Transplantar clones enraizados', 'Mover para vasos de 1-2L com substrato leve', 2),
('VEGA', 1, 'Ajustar fotoperíodo 18/6', 'Configurar timer para 18h luz / 6h escuro', 2),
('VEGA', 1, 'Iniciar fertilização leve', 'EC 0.8-1.2 mS/cm, NPK com mais N (nitrogênio)', 2),
('VEGA', 1, 'Monitorar estresse de transplante', 'Observar murcha ou amarelamento nas primeiras 48h', 2),
('VEGA', 1, 'Manter umidade elevada', 'RH 65-70% para facilitar adaptação', 2);

-- ========================================
-- VEGA - Semana 2 (Estufa B)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('VEGA', 2, 'Aumentar intensidade luminosa', 'PPFD 400-500 µmol/m²/s conforme plantas se adaptam', 2),
('VEGA', 2, 'Iniciar treinamento LST', 'Dobrar caule principal para distribuir auxinas', 2),
('VEGA', 2, 'Aumentar EC gradualmente', 'Elevar para 1.2-1.5 mS/cm conforme crescimento', 2),
('VEGA', 2, 'Verificar desenvolvimento radicular', 'Raízes devem estar colonizando o vaso', 2),
('VEGA', 2, 'Ajustar ventilação', 'Garantir troca de ar adequada, evitar ar parado', 2);

-- ========================================
-- VEGA - Semana 3 (Estufa B)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('VEGA', 3, 'Verificar altura das plantas', 'Medir crescimento vertical, ajustar distância da luz', 2),
('VEGA', 3, 'Ajustar distância da luz', 'Manter 30-45cm das copas para evitar stress luminoso', 2),
('VEGA', 3, 'Verificar deficiências nutricionais', 'Inspecionar coloração e forma das folhas', 2),
('VEGA', 3, 'Continuar LST', 'Redirecionar ramos laterais para exposição uniforme', 2),
('VEGA', 3, 'Monitorar pH do substrato', 'Manter faixa 6.0-6.5 para absorção ideal', 2);

-- ========================================
-- VEGA - Semana 4 (Estufa B)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('VEGA', 4, 'Considerar transplante final', 'Mover para vasos de 5-10L se raízes estiverem apertadas', 2),
('VEGA', 4, 'Aumentar PPFD para máximo', 'Elevar para 550-650 µmol/m²/s gradualmente', 2),
('VEGA', 4, 'Aplicar técnica de topping', 'Cortar ponta principal para ramificação (opcional)', 2),
('VEGA', 4, 'Aumentar EC para pico vegetativo', 'Elevar para 1.5-1.8 mS/cm', 2),
('VEGA', 4, 'Verificar espaçamento entre plantas', 'Garantir circulação de ar e penetração de luz', 2);

-- ========================================
-- VEGA - Semana 5 (Estufa B)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('VEGA', 5, 'Realizar defoliação estratégica', 'Remover folhas grandes que bloqueiam luz inferior', 2),
('VEGA', 5, 'Preparar para transição', 'Plantas devem ter estrutura robusta para floração', 2),
('VEGA', 5, 'Verificar sexo das plantas', 'Identificar pré-flores nos nós (se aplicável)', 2),
('VEGA', 5, 'Manter EC estável', 'Continuar 1.5-1.8 mS/cm, evitar oscilações', 2),
('VEGA', 5, 'Ajustar temperatura noturna', 'Diferencial dia/noite de 4-6°C para vigor', 2);

-- ========================================
-- VEGA - Semana 6 (Estufa B)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('VEGA', 6, 'Última defoliação vegetativa', 'Remover folhas danificadas ou bloqueando luz', 2),
('VEGA', 6, 'Verificar altura final', 'Plantas devem ter 30-50cm antes de mover para floração', 2),
('VEGA', 6, 'Preparar transferência para Estufa C', 'Plantas prontas para iniciar floração', 2),
('VEGA', 6, 'Flush leve (opcional)', 'Regar com água pH ajustado para limpar sais', 2),
('VEGA', 6, 'Documentar estado das plantas', 'Fotografar e anotar altura, saúde geral', 2);

-- ========================================
-- FLORA - Semana 1 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 1, 'Mudar fotoperíodo para 12/12', 'Configurar timer para 12h luz / 12h escuro', 3),
('FLORA', 1, 'Transicionar para nutrientes de floração', 'Aumentar P e K, reduzir N gradualmente', 3),
('FLORA', 1, 'Ajustar EC para floração inicial', 'Manter 1.6-1.8 mS/cm', 3),
('FLORA', 1, 'Reduzir umidade gradualmente', 'Começar a baixar RH para 55-65%', 3),
('FLORA', 1, 'Monitorar stretch (esticamento)', 'Plantas podem dobrar de altura nas primeiras 3 semanas', 3);

-- ========================================
-- FLORA - Semana 2 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 2, 'Continuar monitorando stretch', 'Ajustar distância da luz conforme crescimento', 3),
('FLORA', 2, 'Instalar suportes se necessário', 'Telas ou estacas para ramos que vão carregar flores', 3),
('FLORA', 2, 'Aumentar P e K', 'Fórmula de floração completa, EC 1.8-2.0 mS/cm', 3),
('FLORA', 2, 'Identificar primeiros pistilos', 'Flores femininas começam a aparecer nos nós', 3),
('FLORA', 2, 'Manter temperatura estável', 'Evitar oscilações bruscas durante stretch', 3);

-- ========================================
-- FLORA - Semana 3 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 3, 'Fim do stretch', 'Crescimento vertical deve desacelerar', 3),
('FLORA', 3, 'Defoliação de floração', 'Remover folhas grandes bloqueando sítios de flores', 3),
('FLORA', 3, 'Aumentar ventilação', 'Flores densas precisam de boa circulação de ar', 3),
('FLORA', 3, 'Monitorar formação de buds', 'Cachos de flores começam a se formar', 3),
('FLORA', 3, 'Reduzir umidade para 50-60%', 'Prevenir mofo e bolor em flores densas', 3);

-- ========================================
-- FLORA - Semana 4 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 4, 'Pico de formação de buds', 'Flores engrossando rapidamente', 3),
('FLORA', 4, 'Aumentar EC para pico', 'Elevar para 2.0-2.2 mS/cm', 3),
('FLORA', 4, 'Verificar deficiências', 'Plantas consomem muitos nutrientes nesta fase', 3),
('FLORA', 4, 'Monitorar pragas', 'Ácaros e tripes são atraídos por flores', 3),
('FLORA', 4, 'Ajustar suportes', 'Ramos podem precisar de apoio adicional', 3);

-- ========================================
-- FLORA - Semana 5 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 5, 'Flores atingindo tamanho máximo', 'Buds densos e resinosos', 3),
('FLORA', 5, 'Manter EC alto', 'Continuar 2.0-2.2 mS/cm', 3),
('FLORA', 5, 'Reduzir umidade para 45-55%', 'Minimizar risco de mofo', 3),
('FLORA', 5, 'Verificar tricomas com lupa', 'Começar a monitorar maturação', 3),
('FLORA', 5, 'Aumentar diferencial de temperatura', 'Noites mais frias intensificam aromas', 3);

-- ========================================
-- FLORA - Semana 6 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 6, 'Monitorar maturação de tricomas', 'Maioria deve estar leitosa/turva', 3),
('FLORA', 6, 'Reduzir EC gradualmente', 'Começar a baixar para 1.6-1.8 mS/cm', 3),
('FLORA', 6, 'Observar coloração de pistilos', '50-70% devem estar alaranjados/marrons', 3),
('FLORA', 6, 'Manter umidade baixa', 'RH 40-50% para prevenir mofo', 3),
('FLORA', 6, 'Preparar para flush', 'Planejar início da lavagem nas próximas semanas', 3);

-- ========================================
-- FLORA - Semana 7 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 7, 'Iniciar flush (lavagem)', 'Regar apenas com água pH ajustado, sem nutrientes', 3),
('FLORA', 7, 'Monitorar tricomas diariamente', 'Colher quando 10-30% estiverem âmbar', 3),
('FLORA', 7, 'Verificar amarelamento de folhas', 'Normal durante flush, planta consome reservas', 3),
('FLORA', 7, 'Reduzir rega', 'Deixar substrato secar mais entre regas', 3),
('FLORA', 7, 'Preparar área de secagem', 'Ambiente escuro, 18-21°C, RH 50-60%', 3);

-- ========================================
-- FLORA - Semana 8 (Estufa C)
-- ========================================
INSERT INTO taskTemplates (phase, weekNumber, title, description, tentId) VALUES
('FLORA', 8, 'Decisão de colheita', 'Avaliar tricomas, pistilos e densidade das flores', 3),
('FLORA', 8, 'Continuar flush', 'Manter apenas água pH ajustado', 3),
('FLORA', 8, 'Reduzir umidade para 40-45%', 'Facilitar secagem pós-colheita', 3),
('FLORA', 8, 'Escurecer últimas 48h (opcional)', 'Alguns cultivadores escurecem antes da colheita', 3),
('FLORA', 8, 'Preparar ferramentas de colheita', 'Tesouras limpas, luvas, área de processamento', 3);

-- Verificar total de taskTemplates inseridos
SELECT phase, weekNumber, COUNT(*) as total_tasks
FROM taskTemplates
GROUP BY phase, weekNumber
ORDER BY 
  CASE phase 
    WHEN 'CLONING' THEN 1 
    WHEN 'MAINTENANCE' THEN 2 
    WHEN 'VEGA' THEN 3 
    WHEN 'FLORA' THEN 4 
  END,
  weekNumber;

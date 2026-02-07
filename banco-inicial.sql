-- ============================================
-- App Cultivo - Banco de Dados Inicial
-- ============================================
-- Este arquivo contém dados de exemplo para começar a usar o app imediatamente
-- Inclui: 3 estufas, 1 strain, ciclos ativos, tarefas e parâmetros

-- ============================================
-- TENTS (Estufas)
-- ============================================

INSERT INTO tents (id, name, type, width, height, depth, isActive, createdAt) VALUES
(1, 'Estufa A', 'A', 45, 90, 75, 1, '2026-01-31 00:00:00'),
(2, 'Estufa B', 'B', 60, 120, 60, 1, '2026-01-10 00:00:00'),
(3, 'Estufa C', 'C', 60, 150, 120, 1, '2026-02-07 00:00:00');

-- ============================================
-- STRAINS (Variedades)
-- ============================================

INSERT INTO strains (id, name, type, isActive, createdAt) VALUES
(1, 'Padrão', 'HYBRID', 1, '2026-01-01 00:00:00');

-- ============================================
-- CYCLES (Ciclos Ativos)
-- ============================================

INSERT INTO cycles (id, tentId, strainId, phase, weekNumber, startDate, status, createdAt) VALUES
(1, 1, 1, 'MAINTENANCE', 2, '2026-01-31', 'ACTIVE', '2026-01-31 00:00:00'),
(2, 2, 1, 'VEGA', 5, '2026-01-10', 'ACTIVE', '2026-01-10 00:00:00'),
(3, 3, 1, 'FLORA', 1, '2026-02-07', 'ACTIVE', '2026-02-07 00:00:00');

-- ============================================
-- WEEKLY TARGETS (Parâmetros Semanais)
-- ============================================

-- Clonagem (Semanas 1-3)
INSERT INTO weekly_targets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax) VALUES
(1, 'CLONING', 1, 22, 26, 70, 80, 100, 150),
(1, 'CLONING', 2, 22, 26, 70, 80, 150, 200),
(1, 'CLONING', 3, 22, 26, 65, 75, 150, 200);

-- Manutenção (Plantas-mãe)
INSERT INTO weekly_targets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax) VALUES
(1, 'MAINTENANCE', 1, 22, 26, 55, 65, 300, 400),
(1, 'MAINTENANCE', 2, 22, 26, 55, 65, 300, 400),
(1, 'MAINTENANCE', 3, 22, 26, 55, 65, 300, 400);

-- Vegetativa (Semanas 1-8)
INSERT INTO weekly_targets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax) VALUES
(1, 'VEGA', 1, 22, 28, 60, 70, 300, 400),
(1, 'VEGA', 2, 22, 28, 60, 70, 350, 450),
(1, 'VEGA', 3, 22, 28, 55, 65, 400, 500),
(1, 'VEGA', 4, 22, 28, 55, 65, 450, 550),
(1, 'VEGA', 5, 22, 28, 50, 60, 500, 600),
(1, 'VEGA', 6, 22, 28, 50, 60, 500, 600),
(1, 'VEGA', 7, 22, 28, 50, 60, 500, 600),
(1, 'VEGA', 8, 22, 28, 50, 60, 500, 600);

-- Floração (Semanas 1-12)
INSERT INTO weekly_targets (strainId, phase, weekNumber, tempMin, tempMax, rhMin, rhMax, ppfdMin, ppfdMax) VALUES
(1, 'FLORA', 1, 20, 26, 50, 60, 500, 600),
(1, 'FLORA', 2, 20, 26, 50, 60, 550, 650),
(1, 'FLORA', 3, 20, 26, 45, 55, 600, 700),
(1, 'FLORA', 4, 20, 26, 45, 55, 650, 750),
(1, 'FLORA', 5, 20, 26, 40, 50, 700, 800),
(1, 'FLORA', 6, 20, 26, 40, 50, 750, 850),
(1, 'FLORA', 7, 20, 26, 40, 50, 800, 900),
(1, 'FLORA', 8, 20, 26, 35, 45, 800, 900),
(1, 'FLORA', 9, 20, 26, 35, 45, 750, 850),
(1, 'FLORA', 10, 20, 26, 30, 40, 700, 800),
(1, 'FLORA', 11, 20, 26, 30, 40, 650, 750),
(1, 'FLORA', 12, 20, 26, 30, 40, 600, 700);

-- ============================================
-- TASK TEMPLATES (Templates de Tarefas)
-- ============================================

-- Tarefas para Estufa A (Manutenção)
INSERT INTO task_templates (context, phase, weekNumber, title, description, frequency) VALUES
('TENT_A', 'MAINTENANCE', 1, 'Manter plantas-mãe saudáveis', 'Verificar saúde geral, remover folhas mortas', 'WEEKLY'),
('TENT_A', 'MAINTENANCE', 1, 'Aplicar nutrientes vegetativos', 'Manter EC estável, pH 5.8-6.2', 'WEEKLY'),
('TENT_A', 'MAINTENANCE', 1, 'Controlar altura das plantas', 'Podar se necessário para manter tamanho', 'WEEKLY'),
('TENT_A', 'MAINTENANCE', 1, 'Inspecionar pragas e doenças', 'Verificar folhas e caules', 'WEEKLY'),
('TENT_A', 'MAINTENANCE', 1, 'Limpar e desinfetar área', 'Manter ambiente limpo', 'WEEKLY');

-- Tarefas para Estufa B/C (Vegetativa)
INSERT INTO task_templates (context, phase, weekNumber, title, description, frequency) VALUES
('TENT_BC', 'VEGA', 1, 'Transplantar para vaso maior', 'Usar substrato novo, regar bem', 'ONCE'),
('TENT_BC', 'VEGA', 1, 'Iniciar nutrientes vegetativos', 'Começar com 50% da dose', 'ONCE'),
('TENT_BC', 'VEGA', 2, 'Aumentar intensidade de luz', 'Ajustar para 400-500 PPFD', 'ONCE'),
('TENT_BC', 'VEGA', 3, 'Aplicar LST (Low Stress Training)', 'Amarrar ramos para distribuir luz', 'WEEKLY'),
('TENT_BC', 'VEGA', 4, 'Realizar defoliação estratégica', 'Remover folhas grandes que bloqueiam luz', 'ONCE'),
('TENT_BC', 'VEGA', 5, 'Preparar para transição', 'Verificar sexo das plantas', 'ONCE');

-- Tarefas para Estufa B/C (Floração)
INSERT INTO task_templates (context, phase, weekNumber, title, description, frequency) VALUES
('TENT_BC', 'FLORA', 1, 'Mudar fotoperíodo para 12/12', 'Ajustar timer de luz', 'ONCE'),
('TENT_BC', 'FLORA', 1, 'Transicionar para nutrientes de floração', 'Reduzir N, aumentar P e K', 'ONCE'),
('TENT_BC', 'FLORA', 2, 'Ajustar temperatura noturna', 'Reduzir para 18-20°C', 'ONCE'),
('TENT_BC', 'FLORA', 3, 'Verificar sexo das plantas', 'Remover machos se houver', 'ONCE'),
('TENT_BC', 'FLORA', 4, 'Ajustar EC para floração inicial', 'Aumentar gradualmente EC', 'ONCE'),
('TENT_BC', 'FLORA', 5, 'Manter EC estável', 'Monitorar e ajustar diariamente', 'WEEKLY'),
('TENT_BC', 'FLORA', 6, 'Reduzir umidade gradualmente', 'Alvo: 40-45%', 'WEEKLY'),
('TENT_BC', 'FLORA', 7, 'Ajustar temperatura noturna', 'Reduzir para 16-18°C', 'ONCE'),
('TENT_BC', 'FLORA', 8, 'Monitorar tricomas', 'Verificar maturação com lupa', 'WEEKLY'),
('TENT_BC', 'FLORA', 9, 'Reduzir umidade para 35%', 'Prevenir mofo', 'ONCE'),
('TENT_BC', 'FLORA', 10, 'Iniciar flush (lavagem)', 'Regar apenas com água pH ajustado', 'ONCE'),
('TENT_BC', 'FLORA', 11, 'Continuar flush', 'Manter apenas água', 'WEEKLY'),
('TENT_BC', 'FLORA', 12, 'Preparar para colheita', 'Verificar tricomas, planejar secagem', 'ONCE');

-- ============================================
-- SAFETY LIMITS (Limites de Segurança)
-- ============================================

INSERT INTO safety_limits (context, phase, metric, minValue, maxValue) VALUES
-- Estufa A (Manutenção)
('TENT_A', 'MAINTENANCE', 'TEMP', 18, 30),
('TENT_A', 'MAINTENANCE', 'RH', 45, 75),
('TENT_A', 'MAINTENANCE', 'PPFD', 200, 500),

-- Estufa B/C (Vegetativa)
('TENT_BC', 'VEGA', 'TEMP', 18, 32),
('TENT_BC', 'VEGA', 'RH', 40, 80),
('TENT_BC', 'VEGA', 'PPFD', 250, 700),

-- Estufa B/C (Floração)
('TENT_BC', 'FLORA', 'TEMP', 16, 28),
('TENT_BC', 'FLORA', 'RH', 25, 60),
('TENT_BC', 'FLORA', 'PPFD', 400, 1000);

-- ============================================
-- FIM DO ARQUIVO
-- ============================================

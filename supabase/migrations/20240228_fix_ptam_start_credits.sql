-- Fix PTAM Start plan credits
-- This SQL updates the 'relatorios_incluidos' for the 'PTAM Start' plan from 10 to 5.

UPDATE plans
SET relatorios_incluidos = 5
WHERE nome = 'PTAM Start';

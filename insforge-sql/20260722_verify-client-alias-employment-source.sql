-- Ejecutar despues del script de esquema para comprobar que el cambio quedo aplicado.

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clients'
  AND column_name IN ('alias', 'situacion_laboral', 'fuente')
ORDER BY column_name;

SELECT
  conname,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.clients'::regclass
  AND conname = 'clients_situacion_laboral_check';

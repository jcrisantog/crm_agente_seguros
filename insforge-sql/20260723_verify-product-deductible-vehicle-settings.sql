-- Ejecutar después del script de esquema para comprobar que el cambio quedó aplicado.

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
  AND column_name = 'has_deductible';

SELECT
  id,
  show_vehicle_data,
  singleton,
  created_at
FROM public.system_settings;

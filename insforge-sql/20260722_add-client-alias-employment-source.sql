-- Ejecutar manualmente en el editor SQL de InsForge.
-- Agrega datos opcionales al perfil de asegurado sin modificar registros existentes.

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS alias text,
  ADD COLUMN IF NOT EXISTS situacion_laboral text,
  ADD COLUMN IF NOT EXISTS fuente text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'clients_situacion_laboral_check'
      AND conrelid = 'public.clients'::regclass
  ) THEN
    ALTER TABLE public.clients
      ADD CONSTRAINT clients_situacion_laboral_check
      CHECK (
        situacion_laboral IS NULL
        OR situacion_laboral IN ('Empleado', 'Independiente', 'Otro')
      );
  END IF;
END $$;

COMMENT ON COLUMN public.clients.alias IS
  'Nombre preferido para comunicaciones; si es nulo o contiene solo espacios se usa full_name.';

COMMENT ON COLUMN public.clients.situacion_laboral IS
  'Situacion laboral opcional: Empleado, Independiente u Otro.';

COMMENT ON COLUMN public.clients.fuente IS
  'Origen comercial del contacto; texto libre con sugerencias reutilizables en la interfaz.';

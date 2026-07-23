-- Ejecutar manualmente en el editor SQL de InsForge.
-- Agrega el indicador de deducible al catálogo y una configuración global
-- que conserva visible la sección de datos de vehículo por defecto.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_deductible boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_vehicle_data boolean NOT NULL DEFAULT true,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_singleton_check CHECK (singleton = true)
);

INSERT INTO public.system_settings (show_vehicle_data)
VALUES (true)
ON CONFLICT (singleton) DO NOTHING;

GRANT SELECT, INSERT, UPDATE ON public.system_settings TO authenticated;

COMMENT ON COLUMN public.products.has_deductible IS
  'Indica si el tipo de seguro maneja deducible; no representa monto ni porcentaje.';

COMMENT ON COLUMN public.system_settings.show_vehicle_data IS
  'Controla globalmente la visibilidad de los datos de vehículo en los formularios de póliza.';

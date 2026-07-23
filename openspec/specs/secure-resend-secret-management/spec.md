## Requirements

### Requirement: Server-side Resend credential source
El sistema SHALL inicializar Resend exclusivamente con `RESEND_API_KEY` obtenida desde configuracion server-side del runtime actual.

#### Scenario: InsForge function initializes Resend
- **WHEN** una funcion InsForge que envia correos necesita crear el cliente de Resend
- **THEN** MUST leer la llave desde `Deno.env.get("RESEND_API_KEY")`
- **AND** MUST NOT usar una llave hardcodeada ni un fallback sensible

#### Scenario: Next.js API route initializes Resend
- **WHEN** una ruta API server-side de Next.js necesita crear el cliente de Resend
- **THEN** MUST leer la llave desde `process.env.RESEND_API_KEY`
- **AND** MUST NOT exponer la llave con prefijos publicos como `NEXT_PUBLIC_`

### Requirement: Missing Resend credential handling
El sistema SHALL fallar de forma explicita y accionable cuando `RESEND_API_KEY` no este configurada.

#### Scenario: Credential missing during email send
- **WHEN** un flujo de envio de correo se ejecuta sin `RESEND_API_KEY`
- **THEN** MUST stop before calling Resend
- **AND** MUST return or log an error that identifies `RESEND_API_KEY` as missing configuration
- **AND** MUST NOT include any secret value in the error message

### Requirement: No repository-stored Resend secrets
El repositorio SHALL NOT contain llaves reales de Resend en codigo fuente, scripts, documentacion versionable o archivos temporales conservados.

#### Scenario: Source scan for Resend secrets
- **WHEN** se revisan archivos versionables del proyecto
- **THEN** no MUST existir ninguna llave real de Resend hardcodeada
- **AND** placeholders o nombres de variables son permitidos si no contienen un secreto valido

### Requirement: Environment-specific deployment configuration
Cada entorno SHALL configure `RESEND_API_KEY` en su mecanismo seguro de secretos o variables server-side.

#### Scenario: InsForge project deployment
- **WHEN** una funcion de correo se despliega en un proyecto InsForge
- **THEN** ese proyecto MUST have an active secret named `RESEND_API_KEY`

#### Scenario: Dokploy service deployment
- **WHEN** la app Next.js se despliega en Dokploy
- **THEN** el servicio MUST have a server-side environment variable named `RESEND_API_KEY`
- **AND** la variable MUST NOT be exposed to browser bundles

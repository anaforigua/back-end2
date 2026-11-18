/*
  Ejecutar UNA VEZ despues de restaurar revenfy.backup.
  Hashea las contrasenas en texto plano y asigna contrasena a los ids 1 y 3.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE usuario
SET contrasena = crypt(contrasena, gen_salt('bf', 12))
WHERE contrasena <> '' AND contrasena NOT LIKE '$2%';

-- MIGRAR CONTRASENAS HASH ID 1 Y 3

UPDATE usuario
SET contrasena = crypt('AnaClave2026', gen_salt('bf', 12))
WHERE id_usuarios = 1 AND contrasena = '';

UPDATE usuario
SET contrasena = crypt('MarianaClave2026', gen_salt('bf', 12))
WHERE id_usuarios = 3 AND contrasena = '';
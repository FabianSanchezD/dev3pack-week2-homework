# Cómo entregar tu solución

Cada estudiante hace un **pull request** a este repositorio. La entrega debe contener un único archivo TypeScript con su trabajo y llamarse según el usuario de GitHub del autor del PR.

## Dos formatos válidos

Para el usuario de ejemplo `octocat`, elegí uno:

```text
submissions/octocat.ts
```

```text
submissions/octocat/solution.ts
```

La segunda opción permite una subcarpeta, pero sigue admitiendo **solo un archivo** dentro. No se aceptan ambos formatos en el mismo PR. Usá el usuario exacto, con sus mayúsculas. En tu archivo deben estar las diez funciones exportadas y el objeto `reflection`, con respuestas en español y evidencia resumida de tu ejecución.

## Pasos

1. Hacé un fork del repo y cloná tu fork.
2. Creá una rama: `git switch -c feat/campus-credits`.
3. Copiá la plantilla: `cp starter/solution.ts submissions/TU_USUARIO.ts`.
4. Completá el código en inglés y los comentarios/respuestas en español.
5. Ejecutá `npm run check`, `npm test` y `npm run grade -- submissions/TU_USUARIO.ts`.
6. Con tu nodo local iniciado, ejecutá `npm run campus -- submissions/TU_USUARIO.ts --execute-local`.
7. Leé `reports/latest.json` y resumí los resultados, firmas locales, saldo final y errores esperados en `reflection.evidence`. Las firmas locales solo se consultan contra el mismo nodo mientras conserve el ledger; no aparecen en el Explorer público de devnet.
8. Añadí únicamente tu archivo, hacé un commit y subí la rama a tu fork.
9. Abrí un pull request hacia la rama `main` del repositorio original y completá su checklist.

Si elegís subcarpeta, primero ejecutá `mkdir -p submissions/TU_USUARIO` y copiá la plantilla a `submissions/TU_USUARIO/solution.ts`. Usá esa ruta en todos los comandos posteriores. La plantilla solo importa paquetes, así que funciona en ambos formatos.

## Qué no debe cambiar tu PR

Conservá `submissions/.gitkeep` y este README. No modifiqués archivos de otros estudiantes, la plantilla, la configuración ni las pruebas. No incluyás `node_modules`, archivos `.env`, claves privadas, wallets exportadas, PDF, capturas ni el reporte JSON como archivos adicionales. Podés pegar información pública del reporte como texto dentro de `reflection`.

El control automático del PR comprueba **solo el formato de entrega**. Un check verde no significa que el ejercicio esté aprobado: se revisan la ejecución técnica y las respuestas conceptuales.

## Si te piden cambios

Editá tu mismo archivo y añadí otro commit a la misma rama; el PR se actualiza. No abras otro PR ni cambies de formato de entrega. Si ya elegiste un formato en una entrega aceptada, mantenelo en futuras correcciones.

# Guía para el docente

## Alcance

El reto conecta los módulos 03, 04 y 05 mediante un cliente Kit. Se entrega un esqueleto compilable, no una solución completa. El flujo, la financiación local y las aserciones están provistos para concentrar el trabajo del estudiante en accounts, instrucciones, autoridades y construcción de transacciones.

Relación con el material:

- **Accounts & Transactions:** cuenta frente a dirección, owner/executable/data/lamports, rent, PDA de ATA, fee payer, signers, atomicidad y fees de un fallo incluido.
- **Solana Kit:** RPC HTTP y WebSocket, `bigint`, signers, `pipe`, mensaje v0, blockhash, firma, simulación, logs/CU y confirmación.
- **Tokens:** mint, tres ATAs, decimales, emisión, TransferChecked, BurnChecked, freeze/thaw y revocar mint authority; elección razonada entre SPL y Token-2022.

Delegados, wSOL, metadata, CloseAccount, extensiones y un programa personalizado quedan como ampliaciones; no son necesarios para aprobar.

## Revisar una entrega

1. Comprobá que el PR cambia exactamente `submissions/<autor>.ts` o `submissions/<autor>/solution.ts` y conserva los exports.
2. Revisá primero el código. Las entregas TypeScript son código ejecutable; evaluá en un entorno local desechable sin credenciales ni secretos.
3. Ejecutá `npm ci`, `npm run check`, `npm test` y `npm run grade -- <ruta>`.
4. Iniciá Surfpool offline y ejecutá `npm run campus -- <ruta> --execute-local`.
5. Verificá que el reporte termina con 750/210/30 y supply 990, que no hay mint authority y que los errores corresponden a las instrucciones esperadas. El freeze authority se mantiene intencionalmente.
6. Aplicá la rúbrica de `EXERCISE.md` y revisá las respuestas. No alcanza con devolver valores fijos para pasar los tests rápidos.

El workflow de entregas usa la regla del commit base, valida archivos vía API y no importa código de estudiantes. Un check verde solo valida el formato. El workflow de base se ejecuta en `main` o manualmente; no realiza pruebas de integración en un nodo.

El ejecutor puede usarse con un nodo existente; no modifica la configuración global de Solana. Cada ejecución crea wallets nuevas y un mint distinto, sin guardar claves. El reporte contiene únicamente direcciones, firmas y resultados públicos. Repetir todo el escenario no vuelve a pagar con las mismas cuentas.

## Límites y discusión

Los tokens son transferibles entre participantes: esto no es un sistema de becas cerrado para producción. Una restricción comercial real requeriría otro diseño. La congelación es una operación administrativa explícita; revocar emisión no elimina esa capacidad. No se cierra ninguna ATA al terminar porque se conservan saldos para inspeccionarlos.

La política del PR controla los archivos cambiados, no todas las futuras rutas del repositorio. Revisá manualmente que un usuario que actualiza una entrega ya aceptada mantenga el formato original. Las preguntas y el reporte están en el mismo archivo para respetar la regla de una entrega de un solo archivo.

## Preparar una edición nueva

Actualizá dependencias de forma coordinada con su lockfile y verificá una solución de referencia fuera de las entregas públicas. Conservá intencionalmente los TODO de `starter/solution.ts`. No publiques una solución completa entre las submissions antes de que cierre la actividad.

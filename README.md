# Dev3Pack - Week 2 Homework

## El reto: cuentas y transacciones con Solana Kit

Esta semana practicás lo básico de Solana desde TypeScript con **Solana Kit** (`@solana/kit`): leer cuentas y enviar una transacción. Es un ejercicio corto, pensado para entender cada línea.

El script crea dos wallets (Alice y Bob), le da SOL de prueba a Alice, inspecciona algunas cuentas y transfiere **0.5 SOL** de Alice a Bob.

## Qué tenés que hacer

La plantilla está en [`starter/`](starter) y tiene tres archivos:

| Archivo | Qué hace | ¿Lo tocás? |
| --- | --- | --- |
| `accounts.ts` | Leer saldo y datos de una cuenta | Sí: TODO 1 y 2 |
| `transactions.ts` | Crear, armar y firmar una transferencia | Sí: TODO 3, 4 y 5 |
| `main.ts` | Corre todo el flujo usando tus funciones | No, ya está listo |

Los cinco TODOs:

1. `getBalance`: devolver el saldo de una cuenta en lamports.
2. `getAccountSummary`: devolver si existe, owner, lamports, si es ejecutable y tamaño de sus datos.
3. `solToLamports`: convertir SOL a lamports.
4. `createTransferInstruction`: crear la instrucción de transferencia del System Program.
5. `buildTransaction`: armar el mensaje con fee payer, blockhash e instrucciones, y firmarlo.

Además respondés cinco preguntas cortas en el `README.md` de tu carpeta.

**Código, funciones y variables en inglés. Comentarios y respuestas en español.**

## Cómo correrlo

Necesitás Node 24+ y un nodo local de Solana.

```bash
npm install

# En otra terminal, dejá corriendo un nodo local (uno de los dos):
surfpool start
solana-test-validator

# Copiá la plantilla a tu carpeta y completá los TODOs
cp -r starter submissions/TU_USUARIO
npx tsx submissions/TU_USUARIO/main.ts
```

Si todo está bien, vas a ver los datos de las cuentas, la firma de la transacción y los saldos finales: Bob con 0.5 SOL y Alice con un poco menos de 1.5 SOL (por la fee).

Para revisar tipos sin correr nada: `npm run check`.

## Cómo entregar

Cada estudiante hace un **pull request** con su carpeta `submissions/TU_USUARIO/`. Leé los pasos en [la guía de entregas](submissions/README.md).

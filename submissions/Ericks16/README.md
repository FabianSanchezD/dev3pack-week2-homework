# Week 2 - Ericks16

Autor: Erick

## Qué implementé

- `getBalance`: pide el saldo al RPC y devuelve los lamports.
- `getAccountSummary`: devuelve si la cuenta existe, owner, lamports, si es ejecutable y el tamaño de `data`.
- `solToLamports`: convierte SOL a lamports (con `Math.round` para evitar errores de punto flotante).
- `createTransferInstruction`: usa `getTransferSolInstruction` del System Program.
- `buildTransaction`: arma el mensaje con `pipe()` (fee payer, blockhash, instrucciones) y lo firma.

## Salida de la ejecución

Comando: `npx tsx submissions/Ericks16/main.ts` con `solana-test-validator` corriendo en local.

```text
=== Paso 1: cuentas ===

Alice: 9FzeNb8i7pXLvH5EeR593vVaraRoF9QC33hs7J5ZFd5r
┌────────────┬────────────────────────────────────┐
│ (index)    │ Values                             │
├────────────┼────────────────────────────────────┤
│ exists     │ true                               │
│ owner      │ '11111111111111111111111111111111' │
│ lamports   │ 2000000000n                        │
│ executable │ false                              │
│ dataLength │ 0                                  │
└────────────┴────────────────────────────────────┘

Bob (todavía no existe): GaAvUgKC1WSYgGR1WJGtYjVDFiLqGb3icdzc2GALzKS1
┌────────────┬────────┐
│ (index)    │ Values │
├────────────┼────────┤
│ exists     │ false  │
│ owner      │ null   │
│ lamports   │ 0n     │
│ executable │ false  │
│ dataLength │ 0      │
└────────────┴────────┘

System Program: 11111111111111111111111111111111
┌────────────┬───────────────────────────────────────────────┐
│ (index)    │ Values                                        │
├────────────┼───────────────────────────────────────────────┤
│ exists     │ true                                          │
│ owner      │ 'NativeLoader1111111111111111111111111111111' │
│ lamports   │ 1n                                            │
│ executable │ true                                          │
│ dataLength │ 14                                            │
└────────────┴───────────────────────────────────────────────┘

=== Paso 2: transacción ===
Firma: 4j9a9RmYTHjUDXZM6pD6keGvXAsV4nL96H5muN8qZN1WSS2wfijWLEUxarcohHTmb949G37KF6aDuxxjy8czpeB3

=== Paso 3: saldos finales ===
Alice: 1.499995 SOL
Bob: 0.5 SOL

Bob (ahora sí existe): GaAvUgKC1WSYgGR1WJGtYjVDFiLqGb3icdzc2GALzKS1
┌────────────┬────────────────────────────────────┐
│ (index)    │ Values                             │
├────────────┼────────────────────────────────────┤
│ exists     │ true                               │
│ owner      │ '11111111111111111111111111111111' │
│ lamports   │ 500000000n                         │
│ executable │ false                              │
│ dataLength │ 0                                  │
└────────────┴────────────────────────────────────┘
```

## Resultado

Bob terminó con 0.5 SOL y Alice con 1.499995 SOL: los 0.000005 SOL de diferencia son la fee de la transacción (5000 lamports).

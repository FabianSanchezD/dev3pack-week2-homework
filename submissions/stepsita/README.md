# Entrega Week 2 - Cuentas y Transacciones con Solana Kit

## Salida de ejecución 

```text
=== Paso 1: cuentas ===

Alice: EKUFxzq6z1bWPaSA5jwowjj8Ww4smyej5JvJJumq8Uaj
┌────────────┬────────────────────────────────────┐
│ (index)    │ Values                             │
├────────────┼────────────────────────────────────┤
│ exists     │ true                               │
│ owner      │ '11111111111111111111111111111111' │
│ lamports   │ 2000000000n                        │
│ executable │ false                              │
│ dataLength │ 0                                  │
└────────────┴────────────────────────────────────┘

Bob (todavía no existe): EYQ9oJtiBpVAb4RxVHT947pqwQYPwUMpFuonnZLPUhNx
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
Firma: 23jXjVxcx7U7DosPxKTc87Z1c4SSVpYTabGXUy2gun1RFNBrBMTzoE5VEcCyJtUfqwVLit6q9x1uDYStNa8xJdHb

=== Paso 3: saldos finales ===
Alice: 1.499995 SOL
Bob: 0.5 SOL

Bob (ahora sí existe): EYQ9oJtiBpVAb4RxVHT947pqwQYPwUMpFuonnZLPUhNx
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

### Salida ejecutando `npx tsx submissions/gianellacoronel/main.ts`

```
=== Paso 1: cuentas ===

Alice: xid1RJpFhbeQGLW3Ejx7AqQkRMKp8rRGpc1TBWa5YCs
┌────────────┬────────────────────────────────────┐
│ (index)    │ Values                             │
├────────────┼────────────────────────────────────┤
│ exists     │ true                               │
│ owner      │ '11111111111111111111111111111111' │
│ lamports   │ 2000000000n                        │
│ executable │ false                              │
│ dataLength │ 0                                  │
└────────────┴────────────────────────────────────┘

Bob (todavía no existe): 8jAVY5M2odtCLqNV2rFWWPv9MXaRJeGmcWicjQySzwMm
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
Firma: 26z4GqNNKE93qX2yRacC1fF5mwj5kokuUppMU9iUFXZJxRNySxzYgG6CsftF2bpf5MGus4MmHBp63pm9DfcAvJsY

=== Paso 3: saldos finales ===
Alice: 1.499995 SOL
Bob: 0.5 SOL

Bob (ahora sí existe): 8jAVY5M2odtCLqNV2rFWWPv9MXaRJeGmcWicjQySzwMm
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

# Entrega Week 2 — CanduriFranklin

## Implementación completada

- accounts.ts: getBalance y getAccountSummary implementados.
- transactions.ts: solToLamports, createTransferInstruction y buildTransaction implementados.

## Validación

- npm run check (tsc --noEmit): aprobado sin errores.
- Prueba RPC Devnet: 0.5 SOL = 500000000n, lectura de System Program y firma de transacción verificadas.
- Nota del entorno: la CPU local soporta AVX sin AVX2 (solana-test-validator Agave 4.1.2 requiere AVX2), por lo que main.ts se mantuvo intacto apuntando a 127.0.0.1:8899.

# Mi entrega de la semana 2

Practico cuentas y transacciones con Solana Kit. Completo los cinco TODOs en
`accounts.ts` y `transactions.ts`, y conservo `main.ts` igual a la plantilla.

## Cómo lo ejecuto

Uso Node.js 24 y Ubuntu/WSL. Desde la raíz de este repositorio ejecuto:

```bash
npm ci
npm run check
```

En una terminal dejo el nodo local encendido:

```bash
solana-test-validator --ledger /tmp/dev3pack-week2-ledger --bind-address 127.0.0.1
```

En otra terminal, desde la misma carpeta, ejecuto:

```bash
npx tsx submissions/JuliaGastellu/main.ts
```

## Qué practico

- Consulto cuentas por RPC y distingo una dirección de una cuenta que ya existe.
- Conservo los lamports como `bigint`. En la conversión desde SOL redondeo al
  lamport más cercano y rechazo montos negativos, no finitos o fuera del rango
  seguro de `number`. Para una aplicación real preferiría recibir lamports o
  un importe decimal como texto, sin pasar por punto flotante.
- Construyo una instrucción del System Program. Después agrego quién paga la
  comisión, el blockhash y las instrucciones al mensaje, y recién entonces firmo.
- Espero la confirmación antes de consultar los saldos finales.

## Mi comprobación

Ejecuté la entrega el 11 de noviembre de 2026 con `solana-test-validator 4.1.2`.
`npm run check` terminó sin errores. Además de leer la salida, verifiqué por RPC
que la transacción no tuvo errores y pagó una comisión de 5.000 lamports.
Alice terminó con 1.499.995.000 lamports y Bob con 500.000.000 lamports.
Uso cuentas nuevas generadas en memoria; no guardo sus claves privadas.

La firma que registro abajo corresponde a mi nodo local. Las direcciones y la
firma cambian en cada ejecución y no se pueden buscar en devnet o mainnet.

## Mi salida de ejecución

```text
=== Paso 1: cuentas ===

Alice: AS5VQ6ug728Avvdt3S1e8FLhsijRCXwbGv14xGPQ1teR
┌────────────┬────────────────────────────────────┐
│ (index)    │ Values                             │
├────────────┼────────────────────────────────────┤
│ exists     │ true                               │
│ owner      │ '11111111111111111111111111111111' │
│ lamports   │ 2000000000n                        │
│ executable │ false                              │
│ dataLength │ 0                                  │
└────────────┴────────────────────────────────────┘

Bob (todavía no existe): H1KDDGvs4Wra95fSkZXEbj8QWWCoWUg56suDuFA8h53U
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
Firma: 3mykNaky8dbvA1EWFdxb3EASMhLe1jdwFHMXrmepoRH6muiUSey828E9WirnyXnu6P6QBKJYYVbXqqgewfPJ1zjw

=== Paso 3: saldos finales ===
Alice: 1.499995 SOL
Bob: 0.5 SOL

Bob (ahora sí existe): H1KDDGvs4Wra95fSkZXEbj8QWWCoWUg56suDuFA8h53U
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

## Mi repaso de las cinco preguntas

El README principal todavía menciona preguntas, pero el instructor eliminó su
plantilla en el [commit a20a659](https://github.com/FabianSanchezD/dev3pack-week2-homework/commit/a20a65979805664f3f0e9ee6a6e55407bb25c925).
Recuperé esos enunciados del historial y los respondo como repaso.

1. **Owner de una cuenta: ¿qué programa es el owner de la wallet de Alice?
   ¿Por qué el System Program sale con `executable: true`?**
   Observo que Alice pertenece al System Program, que administra las cuentas
   básicas de SOL. Identifico al propio System Program como ejecutable porque
   ejecuta instrucciones; el owner de ese programa es el Native Loader.

2. **Cuentas que no existen: ¿por qué la cuenta de Bob no existía antes de la
   transferencia y después sí?**
   Al generar las claves de Bob solo creo una dirección, sin escribir en la red.
   Después de recibir los 0,5 SOL, encuentro una cuenta con saldo en el nodo.

3. **Fee payer y firmas: ¿quién pagó la fee y quién tuvo que firmar?**
   Configuro a Alice como fee payer y como origen de los fondos, así que firma
   y paga los 5.000 lamports. Bob solo recibe SOL y no necesita firmar.

4. **Blockhash: ¿para qué sirve el blockhash reciente? ¿Qué pasa si es viejo?**
   Incluyo un blockhash reciente para limitar la vigencia de la transacción.
   Si vence antes de procesarse, necesito reconstruir el mensaje con uno nuevo
   y volver a firmarlo; también conservo `lastValidBlockHeight` para detectar el vencimiento.

5. **Atomicidad: si hubiera dos transferencias y la segunda fallara, ¿qué
   pasaría con la primera?**
   No conservaría el cambio de la primera: se revierten los cambios de todas
   las instrucciones. Si la transacción fue procesada y falló en la ejecución,
   la comisión igualmente se cobra.

## Material que consulto

- [Cuentas y transacciones](https://docs.google.com/presentation/d/18irfiloSGXBeNoSvs6GROcISigxatSu5Q7_IP2c3vEY).
- [Solana Kit](https://docs.google.com/presentation/d/1e60KMe2hYSmCehg52S1oQKEDXuT8v6TvP415XNrE3Os).
- [Documentación de transacciones de Solana Kit](https://www.solanakit.com/docs/advanced-guides/transactions).

Usé IA para preparar esta propuesta de código y como apoyo para estudiar los conceptos.

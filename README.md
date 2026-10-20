# Dev3Pack · Week 2 Homework

## El reto: Campus Credits

Una academia quiere repartir créditos de beca que sus estudiantes puedan gastar en la tienda del campus. Tu misión es completar un cliente en TypeScript que cree el token, administre las cuentas y ejecute el ciclo completo con **Solana Kit**.

El ejercicio integra los módulos **Accounts & Transactions**, **Solana Kit** y **Tokens**. Es un proyecto guiado de dificultad inicial/intermedia, pensado para unas **4–6 horas**. La infraestructura está preparada; vos completás diez funciones de un único archivo. No necesitás escribir ni desplegar un programa Rust/Anchor: vas a usar System Program, Associated Token Account Program y SPL Token Program.

**Código, funciones y variables en inglés. Comentarios, explicaciones y respuestas en español.**

## El problema y sus reglas

Hay tres wallets: `academy` (tesorería, fee payer y autoridad del mint), `student` y `store`. Cada una tiene su ATA para el mismo mint. Los firmantes se generan en memoria para cada ejecución local.

1. Inspeccionar una wallet, el Token Program y una dirección de mint todavía inexistente.
2. Crear un mint SPL clásico con **6 decimales**, `academy` como mint authority y freeze authority, y rent consultado por RPC.
3. Crear las tres ATAs de forma idempotente y comprobar su mint, owner y saldo.
4. Emitir **1000 créditos** a la tesorería.
5. Pagar una beca de **250 créditos** al estudiante.
6. Cobrar **40 créditos** del estudiante a la tienda.
7. Quemar **10 créditos** desde la tienda.
8. Probar autoridades incorrectas, decimales incorrectos y una transacción atómica fallida.
9. Congelar la ATA del estudiante, comprobar que no puede transferir y descongelarla.
10. Revocar la mint authority y comprobar que ya no se puede emitir.

| Momento | Tesorería | Estudiante | Tienda | Supply |
| --- | ---: | ---: | ---: | ---: |
| Emisión | 1000 | 0 | 0 | 1000 |
| Beca | 750 | 250 | 0 | 1000 |
| Compra | 750 | 210 | 40 | 1000 |
| Quema y cierre del ejercicio | **750** | **210** | **30** | **990** |

Las cantidades de la tabla son unidades visibles. Las instrucciones usan `bigint` en unidades mínimas: por ejemplo, 250 créditos con 6 decimales son `250_000_000n`. Los créditos no son SOL: el SOL local paga rent y fees.

## Preparación

Necesitás **Node.js 24 o superior**, npm, Git y un nodo local. La opción recomendada es [Surfpool](https://docs.surfpool.run/); también podés usar `solana-test-validator` si ya instalaste [Solana CLI](https://solana.com/docs/intro/installation).

Hacé un fork de [este repositorio](https://github.com/FabianSanchezD/dev3pack-week2-homework) y cloná **tu fork**:

```bash
git clone https://github.com/TU_USUARIO/dev3pack-week2-homework.git
cd dev3pack-week2-homework
npm ci
git switch -c feat/campus-credits
cp starter/solution.ts submissions/TU_USUARIO.ts
```

Reemplazá `TU_USUARIO` por tu nombre exacto de GitHub. También se admite `submissions/TU_USUARIO/solution.ts`; mirá [la guía de entregas](submissions/README.md).

En otra terminal, iniciá una red local aislada:

```bash
NO_DNA=1 surfpool start --offline --no-deploy --ci
```

Alternativa, sin ejecutar ambos nodos a la vez:

```bash
solana-test-validator --reset --ledger test-ledger
```

Los endpoints predeterminados son `http://127.0.0.1:8899` y `ws://127.0.0.1:8900`. No necesitás configurar una wallet ni pedir SOL en devnet. El ejecutor pide SOL de prueba al nodo local y nunca escribe claves privadas. `--reset` elimina únicamente el ledger local indicado: usá una carpeta dedicada.

## Tu trabajo

Editá **solo tu copia** de [starter/solution.ts](starter/solution.ts). Mantené las funciones exportadas y sus tipos; añadí los imports que necesites.

| TODO | Función | Qué tenés que resolver |
| --- | --- | --- |
| 1 | `toRawAmount` | Conversión exacta desde texto, validación y límite `u64`. |
| 2 | `inspectAccount` | Leer `getAccountInfo`, distinguir ausencia y contar bytes reales. |
| 3 | `createMintInstructions` | Crear cuenta con rent e inicializar mint en una transacción. |
| 4 | `createAtaInstructions` | Derivar/crear una ATA idempotente por wallet. |
| 5 | `mintTokensInstruction` | Emitir con la autoridad del mint. |
| 6 | `transferTokensInstruction` | Mover créditos con `TransferChecked`. |
| 7 | `burnTokensInstruction` | Destruir créditos con `BurnChecked`. |
| 8 | `setFrozenInstruction` | Congelar o descongelar con freeze authority. |
| 9 | `revokeMintAuthorityInstruction` | Revocar emisión con `SetAuthority`. |
| 10 | `buildSignedTransaction` | Mensaje v0 con `pipe`, fee payer, blockhash, instrucciones y firmas. |

También completá `reflection` en ese archivo. Ahí explicás qué hiciste y pegás un resumen de la evidencia, sin añadir otros archivos al PR. Las preguntas y criterios están en [docs/EXERCISE.md](docs/EXERCISE.md).

### Comprobar tu avance

```bash
npm run check
npm test
npm run grade -- submissions/TU_USUARIO.ts
npm run campus -- submissions/TU_USUARIO.ts --execute-local
```

- `check` comprueba TypeScript, incluidas las entregas presentes en tu copia local.
- `test` comprueba la infraestructura y las reglas de entrega. **Puede pasar aunque tu solución esté incompleta.**
- `grade` ejecuta seis grupos de comprobaciones rápidas, sin RPC. Al inicio falla por los TODO; es lo esperado. Pasarlo no reemplaza el escenario completo.
- `campus` ejecuta el flujo real en tu nodo local: construye y firma mediante tu función, simula, envía, confirma y verifica los estados. Guarda evidencia en `reports/latest.json`, ignorado por Git. Se construye y firma antes de simular porque RPC necesita la transacción serializada.

**El escenario incluye un fallo intencional enviado a localnet**: una transacción con dos transferencias donde la segunda excede el saldo. Primero verifica el error en simulación; luego omite preflight únicamente para ese caso y comprueba que ambas transferencias se revierten, aunque se cobra el fee. Los demás errores esperados se prueban solo en simulación. El flag `--execute-local` hace explícita esta ejecución y los endpoints están restringidos a localhost.

En una solución correcta, los cuatro comandos terminan con éxito. La plantilla original compila, pero `grade` y `campus` fallan hasta completar las funciones. Los resultados rápidos no son una nota final.

## Entregar por pull request

Tu PR debe añadir o modificar **exactamente un archivo**:

```text
submissions/TU_USUARIO.ts
```

O bien:

```text
submissions/TU_USUARIO/solution.ts
```

El usuario debe coincidir con el autor del PR, incluyendo mayúsculas. Código, comentarios, respuestas y evidencia resumida van en ese único archivo. No modifiqués la plantilla, el README, las pruebas, el lockfile ni entregas ajenas. `/submissions/.gitkeep` ya está incluido y debe conservarse.

```bash
git add submissions/TU_USUARIO.ts
git commit -m "feat: complete campus credits"
git push origin feat/campus-credits
```

Después abrí un pull request desde tu fork hacia `FabianSanchezD/dev3pack-week2-homework`, rama `main`. Título sugerido: `feat: submit TU_USUARIO`. Completá la checklist del PR. Estos comandos son para tu entrega como estudiante; crear el commit no abre el PR automáticamente.

El control de GitHub valida la ruta, el número de archivos y el autor. **No ejecuta código de estudiantes ni certifica la solución técnica.** El docente revisa los comandos anteriores y `reflection` antes de aceptar la entrega. Para corregir algo, hacé otro commit en la misma rama del PR. Más detalles en [submissions/README.md](submissions/README.md).

## Estructura

```text
starter/solution.ts           Plantilla con diez tareas y preguntas
src/run.ts                   Escenario local y verificaciones de estado
src/load-solution.ts         Carga de una entrega
scripts/grade.ts              Comprobaciones rápidas sin red
scripts/submission-policy.cjs Regla de formato de las entregas
tests/                       Pruebas de infraestructura
docs/EXERCISE.md              Requisitos, pistas, rúbrica y preguntas
docs/TEACHING.md              Guía breve para el docente
submissions/                 Un archivo de solución por estudiante
```

## Material de apoyo

El reto se diseñó a partir de los PDF `Accounts_Transactions - Dev3Pack.pdf`, `Solana Kit - dev3pack.pdf` y `Tokens - dev3pack.pdf`. No se redistribuyen los PDF en el repositorio.

Referencias oficiales para consultar las APIs: [Solana Kit](https://www.solanakit.com/docs), [accounts](https://solana.com/docs/core/accounts), [transacciones](https://solana.com/docs/core/transactions), [crear un mint](https://solana.com/docs/tokens/basics/create-mint), [transferir tokens](https://solana.com/docs/tokens/basics/transfer-tokens) y [SPL Token](https://solana.com/docs/tokens/basics). Las dependencias están fijadas y el ejercicio usa la API funcional `pipe` de las diapositivas, con mensajes v0.

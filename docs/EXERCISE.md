# Requisitos y criterios del ejercicio

## 1. Accounts y estado

`inspectAccount` consulta `getAccountInfo(account, { encoding: 'base64', commitment: 'confirmed' }).send()`. Devuelve `exists`, `programOwner`, `lamports`, `dataLength` y `executable` según los tipos de la plantilla. La longitud corresponde a los bytes decodificados, no a los caracteres de la cadena base64. Si el RPC devuelve `null`, los valores son `false`, `null`, `0n`, `0` y `false`.

Inspeccioná estos casos durante el flujo:

| Cuenta | Propiedad que debés observar |
| --- | --- |
| Wallet del estudiante | Owner de programa = System Program; datos vacíos. |
| Mint antes de crearlo | No existe. Generar un signer no crea una cuenta en la cadena. |
| Mint inicializado | Owner de programa = Token Program; 82 bytes; no ejecutable. |
| ATA del estudiante | Owner de programa = Token Program; 165 bytes; datos con `owner = student`. |
| Token Program | Cuenta ejecutable. Su owner es un loader, no una wallet. |

No confundás `account.owner` del RPC (programa propietario) con `token.data.owner` (autoridad que controla los tokens). El ejecutor consulta y valida ambos. Para el mint, consultá rent con el tamaño correcto; no copiés una cantidad fija de lamports de las diapositivas.

## 2. Importes exactos

`toRawAmount(value, decimals)` acepta solo una cadena con dígitos enteros y una parte decimal opcional: `^[0-9]+(?:\.[0-9]+)?$`. `decimals` debe ser un entero entre 0 y 255. Los ceros iniciales están permitidos.

No usés `Number`, `parseFloat` ni aritmética de coma flotante para representar el importe. Separá las partes de la cadena, completá los decimales faltantes y operá con `BigInt`. El resultado debe estar entre `0n` y `2n ** 64n - 1n`, inclusive. Rechazá cualquier exceso de cifras decimales, incluso si las adicionales son ceros.

| Entrada | Decimales | Resultado |
| --- | ---: | --- |
| `"250"` | 6 | `250_000_000n` |
| `"10.25"` | 2 | `1025n` |
| `"0.000001"` | 6 | `1n` |
| `"-1"`, `"1e3"`, `" 1"`, `".5"`, `"1."` | 6 | Error |
| `"1.0000001"` | 6 | Error |
| `"18446744073709551616"` | 0 | Error: excede `u64` |

## 3. Construir instrucciones

Los builders devuelven instrucciones; no hacen llamadas de envío. `createAtaInstructions` puede ser asíncrono para derivar las ATAs. Usá **SPL Token clásico**, `TOKEN_PROGRAM_ADDRESS`, de forma coherente para derivación, instrucciones y lecturas.

- **Mint:** `getCreateAccountInstruction` con payer, signer del nuevo mint, rent recibido, `BigInt(getMintSize())` y `programAddress = TOKEN_PROGRAM_ADDRESS`. Después `getInitializeMintInstruction` con 6 decimales y ambas autoridades apuntando a payer. No separar esas instrucciones en dos transacciones.
- **ATAs:** creá una por cada owner recibido mediante `getCreateAssociatedTokenIdempotentInstructionAsync`. La segunda llamada debe funcionar aunque ya existan.
- **Emitir:** `getMintToInstruction`; el campo de autoridad es `mintAuthority`. El destino es la ATA de tesorería.
- **Transferir:** `getTransferCheckedInstruction` con source, destination, authority, mint, amount y decimals recibidos. No hardcodeés el amount ni reemplacés el owner del estudiante por el fee payer.
- **Quemar:** `getBurnCheckedInstruction` firmado por el owner de la ATA de la tienda.
- **Congelar/descongelar:** `getFreezeAccountInstruction` o `getThawAccountInstruction`. En estos builders el campo se llama `owner`, aunque representa la freeze authority del mint.
- **Revocar emisión:** `getSetAuthorityInstruction`, `owned = mint`, `owner = authority`, `authorityType = AuthorityType.MintTokens`, `newAuthority = null`. Esto no revoca la freeze authority; justificá la diferencia.

Estas pistas muestran las piezas, pero tenés que conectarlas respetando las firmas y las autoridades.

## 4. Solana Kit y transacciones

`buildSignedTransaction` recibe payer, lifetime e instructions. Usá `pipe` para construir un mensaje de versión 0, asignar fee payer signer, asignar blockhash y lastValidBlockHeight, agregar todas las instrucciones en orden y firmar con `signTransactionMessageWithSigners`.

La creación del mint necesita firmas de academy y del nuevo mint. Una compra necesita las de academy (paga el fee) y student (autoriza mover sus tokens). Los signers vienen adjuntos a las instrucciones. No guardés claves ni creés otras wallets dentro de esta función. El ejecutor genera los signers efímeros.

El ejecutor provisto se ocupa de simular, mostrar logs/CU, enviar, confirmar a `confirmed` y leer los estados. Estudiá `src/run.ts` para explicar ese ciclo. Una simulación puede pasar y el envío fallar luego: el estado o el blockhash pueden haber cambiado. El ejecutor no reintenta envíos automáticamente; si expira o hay timeout, falla y podés volver a correr el escenario con wallets nuevas.

No mezcles la API de `@solana/web3.js` ni `@solana/spl-token` con los tipos Kit. No hace falta configurar prioridad de fees para este escenario local. Como extra opcional, explicá cómo estimarías CU y un margen desde la simulación, sin cambiar archivos del ejecutor.

## 5. Casos negativos y atomicidad

El escenario debe rechazar:

1. Transferir desde la ATA del estudiante usando academy como autoridad.
2. Usar 5 decimales cuando el mint tiene 6.
3. Una transacción con transferencia válida de 5 créditos seguida por otra de 9999: el error debe estar en la segunda instrucción. El ejecutor la envía deliberadamente a localnet, verifica el fallo confirmado y que student/tienda conserven 210/30. El fee payer pierde el fee.
4. Transferir desde una ATA congelada. Debe funcionar descongelarla después.
5. Emitir de nuevo tras revocar mint authority. El supply debe seguir en 990.

En los casos 1, 2, 4 y 5, el ejecutor detecta el fallo en simulación y no publica la transacción. Esos intentos no pagan fee. El caso 3 demuestra un fallo incluido en un bloque: el rollback revierte las instrucciones del token, pero no devuelve el fee.

## 6. Respuestas en el mismo archivo

Completá cada propiedad de `reflection` con tus propias palabras:

| Campo | Pregunta |
| --- | --- |
| `githubUsername` | ¿Cuál es el usuario exacto del autor del PR? |
| `accountOwnership` | ¿Quién es el owner del mint y de una ATA en RPC? ¿En qué se diferencia del owner dentro de los datos de esa ATA? |
| `ataAndPda` | ¿Qué tres semillas participan en una ATA y qué programa deriva su dirección? ¿Por qué esa dirección no tiene clave privada? ¿Quién autoriza una transferencia de los tokens? |
| `atomicity` | ¿Qué saldos quedaron tras el fallo en la segunda instrucción y por qué? ¿Qué cambia respecto al cobro de fees entre simular y publicar un fallo? |
| `transactionLifecycle` | ¿Quién paga y quién firma cada tipo de operación? ¿Qué papel tienen blockhash, simulación, `confirmed` y expiración? ¿Cómo evitarías duplicar un pago después de un timeout? |
| `tokenSupply` | ¿Por qué una transferencia mantiene el supply y una quema lo reduce? ¿Revocar mint authority también revoca freeze authority? |
| `tokenProgramChoice` | ¿Por qué alcanza SPL Token clásico? Proponé un requisito que justificaría Token-2022 y explicá su impacto en compatibilidad. |
| `evidence` | Resumí la ejecución, mint, al menos una firma local, saldos, supply, casos negativos y fee del fallo atómico. Indicá que las firmas pertenecen a tu nodo local. |

## Rúbrica · 100 puntos

| Área | Puntos | Evidencia |
| --- | ---: | --- |
| Accounts y rent | 15 | Ausencia, campos y tamaños correctos; programa owner frente a autoridad. |
| Importes | 10 | Exactitud, errores de formato, decimales y límite `u64`. |
| Solana Kit | 20 | Mensaje v0, `pipe`, fee payer, lifetime y todas las firmas. |
| Tokens | 25 | Mint, ATAs idempotentes, emisión, TransferChecked y BurnChecked. |
| Casos negativos y autoridades | 15 | Fallos esperados, rollback, congelar/descongelar y revocación. |
| Explicación y entrega | 15 | Reflection propia, evidencia suficiente y PR con un solo archivo válido. |

`grade` hace comprobaciones parciales y orientativas. La nota requiere el flujo local completo, inspección del código y respuestas conceptuales. Los extras no son obligatorios ni sustituyen requisitos.

## Si algo falla

- **Connection refused / timeout:** iniciá un solo nodo, comprobá los puertos HTTP/WebSocket y mantenelo abierto. El escenario termina ante errores; no queda esperando sin límite una confirmación.
- **TODO:** completá la función indicada; no borres el test ni el `throw` sin implementar su comportamiento.
- **Firma faltante:** conservá el signer completo en las instrucciones que requieren firma, no solo su dirección.
- **Invalid account data / owner:** revisá que las ATAs y el mint usen el mismo Token Program y la misma dirección de mint.
- **Insufficient funds:** distinguí lamports del fee payer de unidades de token del source. Solo el fallo atómico deliberado debe exceder el saldo.
- **No veo el nombre del token:** un mint SPL no almacena nombre/símbolo; metadata queda fuera del alcance obligatorio.
- **El check del PR falla:** verificá autor, mayúsculas, ruta y que solo exista un archivo cambiado. No incluyás esta documentación en tu entrega.

# Cómo entregar tu tarea

Cada estudiante entrega su trabajo con un **pull request** a este repositorio. Todo va dentro de **una carpeta con tu usuario exacto de GitHub** (con sus mayúsculas).

## Estructura

Para el usuario de ejemplo `octocat`:

```text
submissions/
└── octocat/
    ├── README.md          # Salida de tu ejecución y respuestas
    ├── accounts.ts        # TODO 1 y 2
    ├── transactions.ts    # TODO 3, 4 y 5
    └── main.ts            # Sin cambios
```

## Pasos

1. Hacé un fork de [este repositorio](https://github.com/FabianSanchezD/dev3pack-week2-homework) y cloná **tu fork**.
2. Creá una rama: `git checkout -b feat/TU_USUARIO`.
3. Copiá la plantilla: `cp -r starter submissions/TU_USUARIO`.
4. Completá los TODOs y corré `npx tsx submissions/TU_USUARIO/main.ts` con tu nodo local encendido.
5. En tu `README.md`, pegá la salida y respondé las preguntas.
6. Hacé commit, subí la rama a tu fork y abrí un pull request hacia `main` del repositorio original.
7. Completá el checklist de la plantilla del PR.

## Qué no debe incluir tu PR

- Cambios fuera de `submissions/TU_USUARIO/`.
- `node_modules` ni archivos `.env`.
- Claves privadas o wallets exportadas (por ejemplo, `id.json` o keypairs).

El check automático del PR solo revisa que tus archivos estén en la carpeta correcta. El código y las respuestas se revisan a mano.

## Si te piden cambios

Agregá nuevos commits a la misma rama; el PR se actualiza solo. No abras otro PR.

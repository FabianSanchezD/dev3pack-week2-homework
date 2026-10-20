import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export type Solution = typeof import('../starter/solution.ts');

export async function loadSolution(file = 'starter/solution.ts'): Promise<Solution> {
  if (!file.endsWith('.ts')) throw new Error('La solución debe ser un archivo .ts');
  const solution = await import(pathToFileURL(resolve(file)).href);
  const functions = [
    'toRawAmount', 'inspectAccount', 'createMintInstructions', 'createAtaInstructions',
    'mintTokensInstruction', 'transferTokensInstruction', 'burnTokensInstruction',
    'setFrozenInstruction', 'revokeMintAuthorityInstruction', 'buildSignedTransaction',
  ];
  for (const name of functions) {
    if (typeof solution[name] !== 'function') throw new Error(`Falta el export ${name}`);
  }
  if (!solution.reflection) throw new Error('Falta el export reflection');
  return solution as Solution;
}

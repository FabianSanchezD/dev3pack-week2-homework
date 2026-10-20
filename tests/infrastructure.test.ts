import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadSolution } from '../src/load-solution.ts';

const require = createRequire(import.meta.url);
const { validateSubmission } = require('../scripts/submission-policy.cjs');

test('La plantilla se puede importar y conserva los contratos de la entrega', async () => {
  const solution = await loadSolution();
  assert.equal(typeof solution.buildSignedTransaction, 'function');
  assert.throws(() => solution.toRawAmount('1', 6), /TODO 1/);
});
test('La regla permite los dos formatos de entrega', () => {
  assert(validateSubmission([{ filename: 'submissions/alice.ts', status: 'added' }], 'alice'));
  assert(validateSubmission([{ filename: 'submissions/alice/solution.ts', status: 'modified' }], 'alice'));
});
test('La regla rechaza carpetas ajenas, varios archivos, renombres y cambios fuera de submissions', () => {
  for (const files of [
    [], [{ filename: 'README.md', status: 'modified' }],
    [{ filename: 'submissions/bob.ts', status: 'added' }],
    [{ filename: 'submissions/alice.ts', status: 'renamed' }],
    [{ filename: 'submissions/alice.ts', status: 'removed' }],
    [{ filename: 'submissions/alice.ts', status: 'added' }, { filename: 'submissions/alice/notes.md', status: 'added' }],
  ]) assert.throws(() => validateSubmission(files, 'alice'));
});
test('Submissions conserva .gitkeep y la guía de entregas', async () => {
  assert.equal(await readFile('submissions/.gitkeep', 'utf8'), '');
  assert.match(await readFile('submissions/README.md', 'utf8'), /pull request/i);
});

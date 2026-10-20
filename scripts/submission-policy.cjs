// La misma regla sirve para la prueba local y el control de pull requests.
function validateSubmission(files, username) {
  if (!Array.isArray(files) || files.length !== 1) {
    throw new Error('La entrega debe añadir o modificar exactamente un archivo TypeScript.');
  }
  const file = files[0];
  const validPaths = [`submissions/${username}.ts`, `submissions/${username}/solution.ts`];
  if (!validPaths.includes(file.filename)) {
    throw new Error(`Ruta permitida: ${validPaths.join(' o ')}. Respetá el usuario exacto del autor del PR.`);
  }
  if (!['added', 'modified'].includes(file.status)) {
    throw new Error('La entrega debe añadir o actualizar tu archivo, sin renombrar ni eliminar archivos.');
  }
  return true;
}
module.exports = { validateSubmission };

const documents = [
  { documentNumber: 'CC-123', fullName: 'Lucia Torres', status: 'valid' },
  { documentNumber: 'PP-987', fullName: 'Diego Ramirez', status: 'valid' },
  { documentNumber: 'CE-555', fullName: 'Maria Paez', status: 'review' },
  { documentNumber: 'CC-404', fullName: 'Persona Falsa', status: 'fraud' },
];

function verifyDocument(input) {
  const match = documents.find(
    (doc) => doc.documentNumber === input.documentNumber && doc.fullName.toLowerCase() === input.fullName.toLowerCase()
  );
  if (!match) {
    return { status: 'unknown', reason: 'Documento no encontrado en el repositorio local' };
  }
  if (match.status === 'fraud') {
    return { status: 'rejected', reason: 'Documento reportado como fraude' };
  }
  if (match.status === 'review') {
    return { status: 'pending', reason: 'Documento requiere revisión manual' };
  }
  return { status: 'approved', reason: 'Documento válido' };
}

module.exports = { verifyDocument };

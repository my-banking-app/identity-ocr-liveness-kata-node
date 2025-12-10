import { initDatabase, sequelize } from '../src/config/database';
import { Document } from '../src/database/models/document.model';
import { Blacklist } from '../src/database/models/blacklist.model';

async function seed() {
  await initDatabase();

  // Clear existing
  await Document.destroy({ where: {} });
  await Blacklist.destroy({ where: {} });

  console.log('Seeding Documents...');
  
  await Document.bulkCreate([
    {
      documentNumber: '12345678',
      documentType: 'cedula',
      status: 'valid',
      issueDate: new Date('2020-01-01'),
      expiryDate: new Date('2030-01-01'),
      issuingEntity: 'RNEC'
    },
    {
      documentNumber: '87654321',
      documentType: 'cedula',
      status: 'expired',
      issueDate: new Date('2010-01-01'),
      expiryDate: new Date('2020-01-01'),
      issuingEntity: 'RNEC'
    },
    {
      documentNumber: 'A00123456',
      documentType: 'passport',
      status: 'valid',
      issueDate: new Date('2022-01-01'),
      expiryDate: new Date('2032-01-01'),
      issuingEntity: 'CANCILLERIA'
    }
  ]);

  console.log('Seeding Blacklist...');

  await Blacklist.bulkCreate([
    {
      documentNumber: '11111111',
      reason: 'stolen',
      reportingEntity: 'POLICIA'
    },
    {
      documentNumber: '22222222',
      reason: 'fraud',
      reportingEntity: 'BANCO'
    }
  ]);

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});

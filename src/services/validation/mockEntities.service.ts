// Helper for random delay
const randomDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, Math.random() * ms));

export class MockEntitiesService {
  
  /**
   * RNEC (Registro Nacional del Estado Civil) Simulator
   */
  static async consultRNEC(documentNumber: string) {
    await randomDelay(1000); // Simulate network latency

    // Deterministic mock based on number ending
    const lastDigit = Number.parseInt(documentNumber.slice(-1));
    
    if (lastDigit === 2) {
      return {
        status: 'NOT_FOUND',
        message: 'Document does not exist in RNEC database'
      };
    }

    if (lastDigit === 8) {
        return {
            status: 'CANCELLED',
            reason: 'Death reported',
            date: '2023-01-01'
        };
    }

    return {
      status: 'VALID',
      names: 'CIUDADANO EJEMPLAR',
      issueDate: '2010-05-20',
      place: 'BOGOTA D.C.'
    };
  }

  /**
   * Cancilleria (Passport) Simulator
   */
  static async consultCancilleria(passportNumber: string) {
    await randomDelay(1200);

    if (passportNumber.startsWith('A00')) {
        return { status: 'VALID', type: 'Ordinario', expiry: '2030-01-01' };
    }
    
    return { status: 'INVALID', reason: 'Passport not found or expired' };
  }

  /**
   * RUNT (Driver's License) Simulator
   */
  static async consultRUNT(licenseNumber: string) {
      await randomDelay(800);
      
      // Simulate active licenses
      return {
          status: 'ACTIVE',
          categories: ['B1', 'C1'],
          restrictions: 'USAR LENTES'
      };
  }
}

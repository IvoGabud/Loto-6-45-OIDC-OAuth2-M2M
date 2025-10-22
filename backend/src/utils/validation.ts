export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateTicket = (idNumber: string, numbers: number[]): ValidationResult => {
  // Provjera broja osobne iskaznice
  if (!idNumber || idNumber.trim().length === 0) {
    return { valid: false, error: 'Broj osobne iskaznice ne smije biti prazan' };
  }

  if (idNumber.length > 20) {
    return { valid: false, error: 'Broj osobne iskaznice ne smije biti duži od 20 znakova' };
  }

  // Provjera broja brojeva
  if (numbers.length < 6 || numbers.length > 10) {
    return { valid: false, error: 'Morate unijeti između 6 i 10 brojeva' };
  }

  // Provjera duplikata
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) {
    return { valid: false, error: 'Brojevi se ne smiju ponavljati' };
  }

  // Provjera raspona brojeva (1-45)
  for (const num of numbers) {
    if (num < 1 || num > 45) {
      return { valid: false, error: 'Svi brojevi moraju biti u rasponu od 1 do 45' };
    }
  }

  return { valid: true };
};

export const validateDrawnNumbers = (numbers: number[]): ValidationResult => {
  if (numbers.length === 0) {
    return { valid: false, error: 'Morate unijeti barem jedan broj' };
  }

  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) {
    return { valid: false, error: 'Brojevi se ne smiju ponavljati' };
  }

  return { valid: true };
};

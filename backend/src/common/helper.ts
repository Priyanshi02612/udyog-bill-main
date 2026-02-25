/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as bcrypt from 'bcrypt';

export const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const hashOtp = (otp: string) => bcrypt.hash(otp, 10);

export const getNextDocumentNumber = (
  existingNumbers: string[],
  typePrefix: string,
) => {
  const year = new Date().getFullYear();
  const prefix = `${typePrefix}-${year}-`;

  const maxSequence = existingNumbers.reduce((max, currentNumber) => {
    if (!currentNumber.startsWith(prefix)) {
      return max;
    }

    const sequence = Number(currentNumber.slice(prefix.length));
    return Number.isFinite(sequence) ? Math.max(max, sequence) : max;
  }, 0);

  return `${prefix}${String(maxSequence + 1).padStart(3, '0')}`;
};

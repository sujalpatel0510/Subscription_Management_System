import prisma from './prisma';

export interface TaxResolution {
  taxRuleId?: string;
  taxRate: number;
  taxAmount: number;
}

export async function resolveLineTax(
  amountAfterDiscount: number,
  preferredTaxId?: string | null
): Promise<TaxResolution> {
  if (!preferredTaxId) {
    const defaultTax = await prisma.taxRate.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!defaultTax) return { taxRate: 0, taxAmount: 0 };

    const taxAmount = Number(((amountAfterDiscount * defaultTax.rate) / 100).toFixed(2));
    return {
      taxRuleId: defaultTax.id,
      taxRate: defaultTax.rate,
      taxAmount,
    };
  }

  const tax = await prisma.taxRate.findUnique({
    where: { id: preferredTaxId },
  });

  if (!tax || !tax.active) {
    return { taxRate: 0, taxAmount: 0 };
  }

  const taxAmount = Number(((amountAfterDiscount * tax.rate) / 100).toFixed(2));
  return {
    taxRuleId: tax.id,
    taxRate: tax.rate,
    taxAmount,
  };
}

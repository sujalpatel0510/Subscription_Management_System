import prisma from './prisma';

export interface DiscountOutcome {
  discountRuleId: string | null;
  discountCode: string | null;
  discountTotal: number;
}

export async function evaluateEligibleDiscount({
  subtotal,
  totalQuantity,
  productIds,
  requestedCode,
}: {
  subtotal: number;
  totalQuantity: number;
  productIds: string[];
  requestedCode?: string | null;
}): Promise<DiscountOutcome> {
  const now = new Date();

  let candidateRules = await prisma.discountRule.findMany({
    where: {
      active: true,
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    include: {
      eligibilities: true,
    },
  });

  // Filter out exhausted usage limits
  candidateRules = candidateRules.filter(
    (rule) => rule.usageLimit === null || rule.usageCount < rule.usageLimit
  );

  if (requestedCode) {
    const matched = candidateRules.find(
      (r) => r.code.toUpperCase() === requestedCode.trim().toUpperCase()
    );
    if (matched) {
      candidateRules = [matched];
    } else {
      return { discountRuleId: null, discountCode: null, discountTotal: 0 };
    }
  }

  let bestRule = null;
  let maxDiscount = 0;

  for (const rule of candidateRules) {
    if (rule.minAmount && subtotal < rule.minAmount) continue;
    if (rule.minQuantity && totalQuantity < rule.minQuantity) continue;

    if (rule.scopeType === 'PRODUCTS' && rule.eligibilities.length > 0) {
      const allowedIds = rule.eligibilities.map((e) => e.productId).filter(Boolean);
      const matches = productIds.some((pId) => allowedIds.includes(pId));
      if (!matches) continue;
    }

    let calculated = 0;
    if (rule.type === 'PERCENTAGE') {
      calculated = (subtotal * rule.value) / 100;
    } else {
      calculated = Math.min(rule.value, subtotal);
    }

    if (calculated > maxDiscount) {
      maxDiscount = calculated;
      bestRule = rule;
    }
  }

  if (bestRule && maxDiscount > 0) {
    return {
      discountRuleId: bestRule.id,
      discountCode: bestRule.code,
      discountTotal: Number(maxDiscount.toFixed(2)),
    };
  }

  return { discountRuleId: null, discountCode: null, discountTotal: 0 };
}

export async function incrementDiscountUsage(ruleId: string) {
  try {
    await prisma.discountRule.update({
      where: { id: ruleId },
      data: { usageCount: { increment: 1 } },
    });
  } catch (err) {
    console.error('Failed to increment discount usage:', err);
  }
}

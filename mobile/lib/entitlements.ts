import { SubscriptionPlanItem } from './store';

export interface PlanEntitlements {
  planId: string;
  planName: string;
  isPremium: boolean;
  canAccessClinicalNutrition: boolean;
  canAccessSomatotropinSleepSync: boolean;
  canAccessAdvancedStretches: boolean;
  canAccessAiBiomechanicalCalibration: boolean;
  canAccessPrioritySupport: boolean;
  maxProgramWeeks: number;
  aiChatDailyLimit: number;
}

export function resolvePlanEntitlements(
  activePlanId: string | undefined,
  isPremium: boolean,
  subscriptionTier: string | undefined,
  catalogPlans: SubscriptionPlanItem[] = []
): PlanEntitlements {
  // Try finding in live catalog plans
  const matchedPlan =
    catalogPlans.find((p) => p.id === activePlanId) ||
    catalogPlans.find((p) =>
      isPremium
        ? p.id.includes('annual') || p.id.includes('monthly') || p.id.includes('lifetime')
        : p.id.includes('free')
    );

  if (matchedPlan) {
    const isFree = matchedPlan.id.includes('free') || matchedPlan.priceUsd === 0;
    return {
      planId: matchedPlan.id,
      planName: matchedPlan.name,
      isPremium: !isFree,
      canAccessClinicalNutrition: Boolean(matchedPlan.canAccessClinicalNutrition),
      canAccessSomatotropinSleepSync: Boolean(matchedPlan.canAccessSomatotropinSleepSync),
      canAccessAdvancedStretches: Boolean(matchedPlan.canAccessAdvancedStretches),
      canAccessAiBiomechanicalCalibration: Boolean(matchedPlan.canAccessAiBiomechanicalCalibration),
      canAccessPrioritySupport: Boolean(matchedPlan.canAccessPrioritySupport),
      maxProgramWeeks: matchedPlan.maxProgramWeeks ?? (isFree ? 2 : 6),
      aiChatDailyLimit: matchedPlan.aiChatDailyLimit ?? (isFree ? 5 : 20),
    };
  }

  // Fallback defaults based on isPremium flag
  if (!isPremium) {
    return {
      planId: 'plan_free',
      planName: 'Free Starter',
      isPremium: false,
      canAccessClinicalNutrition: false,
      canAccessSomatotropinSleepSync: false,
      canAccessAdvancedStretches: false,
      canAccessAiBiomechanicalCalibration: false,
      canAccessPrioritySupport: false,
      maxProgramWeeks: 2,
      aiChatDailyLimit: 5,
    };
  }

  const isAnnualOrLifetime =
    subscriptionTier?.includes('Annual') || subscriptionTier?.includes('Lifetime');
  return {
    planId: isAnnualOrLifetime ? 'plan_pro_annual' : 'plan_pro_monthly',
    planName: subscriptionTier || 'Tallgrame Pro',
    isPremium: true,
    canAccessClinicalNutrition: true,
    canAccessSomatotropinSleepSync: true,
    canAccessAdvancedStretches: true,
    canAccessAiBiomechanicalCalibration: true,
    canAccessPrioritySupport: Boolean(isAnnualOrLifetime),
    maxProgramWeeks: 6,
    aiChatDailyLimit: isAnnualOrLifetime ? 50 : 20,
  };
}

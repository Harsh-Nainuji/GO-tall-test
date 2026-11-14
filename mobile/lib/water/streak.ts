import { getLocalDate } from './dates';

export interface DayTotal {
  date: string; // YYYY-MM-DD
  total_ml: number;
}

/**
 * Pure function: calculates current consecutive day streak for water intake.
 * Consecutive means each previous calendar day had total_ml >= goal_ml.
 */
export function calculateWaterStreak(
  dailyTotals: DayTotal[],
  goal_ml: number,
  todayStr: string = getLocalDate()
): number {
  if (!dailyTotals || dailyTotals.length === 0 || goal_ml <= 0) {
    return 0;
  }

  const map = new Map<string, number>();
  for (const item of dailyTotals) {
    map.set(item.date, item.total_ml);
  }

  // Parse today
  const [y, m, d] = todayStr.split('-').map(Number);
  const currentDate = new Date(y, m - 1, d);

  // Check if today reached goal
  const todayReached = (map.get(todayStr) || 0) >= goal_ml;

  let streak = 0;
  let checkDate = new Date(currentDate);

  if (todayReached) {
    streak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // If today is not reached yet, check starting from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, '0');
    const day = String(checkDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    const total = map.get(dateKey) || 0;
    if (total >= goal_ml) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

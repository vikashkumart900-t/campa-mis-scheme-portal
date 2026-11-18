//component to get financial years between two dates
export function getFinancialYears(startDate, endDate) {
  if (!startDate || !endDate || endDate < startDate) return [];

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

  const firstYear = start.getFullYear() - (start.getMonth() < 3 ? 1 : 0);
  const lastYear = end.getFullYear() - (end.getMonth() < 3 ? 1 : 0);
  return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => {
    const year = firstYear + index;
    return `${year}-${String(year + 1).slice(-2)}`;
  });
}

export function isToday(date: Date): boolean {
  const todaysDate = new Date();

  return date.setHours(0, 0, 0, 0) === todaysDate.setHours(0, 0, 0, 0);
}

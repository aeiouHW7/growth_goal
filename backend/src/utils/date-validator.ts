export function validateDateString(dateStr: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw Object.assign(new Error(`无效的日期格式: ${dateStr}`), {
      status: 400,
      code: "INVALID_DATE",
    });
  }
  return date;
}

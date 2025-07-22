export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isDelayed = (createdAt: number, status: string): boolean => {
  if (status !== 'Pending') return false;
  const now = Date.now();
  const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);
  return hoursElapsed > 48;
};

export const getHoursElapsed = (createdAt: number): number => {
  const now = Date.now();
  return Math.floor((now - createdAt) / (1000 * 60 * 60));
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // Convert from YYYY-MM-DD to DD-MM-YYYY
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}
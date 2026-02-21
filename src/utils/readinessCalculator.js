export function calculateReadiness({ hoursStudied, completedTasks, totalTasks }) {
  const safeTotalTasks = totalTasks || 1;
  const taskScore = (completedTasks / safeTotalTasks) * 60;
  const hourScore = Math.min(hoursStudied * 8, 40);
  return Math.round(Math.min(taskScore + hourScore, 100));
}

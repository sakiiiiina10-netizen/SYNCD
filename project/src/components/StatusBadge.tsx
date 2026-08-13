interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  paid: { label: 'Paid', classes: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
  unpaid: { label: 'Unpaid', classes: 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400' },
  pending: { label: 'Pending', classes: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  partial: { label: 'Partial', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
  present: { label: 'Present', classes: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
  absent: { label: 'Absent', classes: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
  leave: { label: 'Leave', classes: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
  return <span className={`badge ${config.classes}`}>{config.label}</span>;
}

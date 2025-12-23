interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Scheduled' },
    sent: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Sent' },
    completed: { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed' },
    submitted: { bg: 'bg-green-50', text: 'text-green-700', label: 'Submitted' },
    pending: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Pending' },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

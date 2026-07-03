const statusConfig = {
  AWAITING_TEACHER: { label: 'Ожидает проверки', color: 'bg-yellow-100 text-yellow-800' },
  AWAITING_STUDENT: { label: 'На доработке', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Принято', color: 'bg-green-100 text-green-800' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}const entryConfig = {
  submission: { icon: '📩', bg: 'bg-blue-50 border-blue-200' },
  feedback: { icon: '💬', bg: 'bg-orange-50 border-orange-200' },
  revision: { icon: '🔄', bg: 'bg-green-50 border-green-200' },
  acceptance: { icon: '✅', bg: 'bg-purple-50 border-purple-200' },
};


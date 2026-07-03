const entryConfig = {
  submission: { icon: '📩', bg: 'bg-blue-50 border-blue-200' },
  feedback: { icon: '💬', bg: 'bg-orange-50 border-orange-200' },
  revision: { icon: '🔄', bg: 'bg-green-50 border-green-200' },
  acceptance: { icon: '✅', bg: 'bg-purple-50 border-purple-200' },
};

export default function EntryList({ entries }) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const cfg = entryConfig[entry.entry_type] || entryConfig.submission;
        return (
          <div key={entry.id} className={`p-3 rounded-lg border ${cfg.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{cfg.icon}</span>
              <span className="font-medium capitalize">{entry.role}</span>
              <span className="text-xs text-gray-500">
                {new Date(entry.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
          </div>
        );
      })}
      {entries.length === 0 && (
        <p className="text-gray-400 text-center py-4">История пока пуста</p>
      )}
    </div>
  );
}
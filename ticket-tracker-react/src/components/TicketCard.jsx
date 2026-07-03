import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function TicketCard({ ticket }) {
  return (
    <Link to={`/tickets/${ticket.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <span className="font-semibold text-primary">Задание #{ticket.id}</span>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="text-sm text-gray-500">
          Создано: {new Date(ticket.created_at).toLocaleDateString()}
        </div>
        {ticket.status !== 'COMPLETED' && (
          <div className="text-sm text-gray-600 mt-1">
            Осталось циклов: {ticket.count}
          </div>
        )}
      </div>
    </Link>
  );
}
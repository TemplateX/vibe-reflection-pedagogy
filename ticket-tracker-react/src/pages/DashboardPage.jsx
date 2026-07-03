import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import TicketCard from '../components/TicketCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await api.getTickets(statusFilter);
        setTickets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [statusFilter]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">
          {user.role === 'student' ? 'Мои задания' : 'Задания на проверку'}
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="">Все статусы</option>
            <option value="AWAITING_TEACHER">Ожидает проверки</option>
            <option value="AWAITING_STUDENT">На доработке</option>
            <option value="COMPLETED">Принято</option>
          </select>
          {user.role === 'student' && (
            <Link
              to="/create-ticket"
              className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition"
            >
              + Новое задание
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Загрузка...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Заданий не найдено</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import EntryList from '../components/EntryList';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionContent, setActionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const data = await api.getTicket(id);
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleAction = async (action) => {
    if (!actionContent.trim()) return;
    setSubmitting(true);
    try {
      switch (action) {
        case 'feedback':
          await api.addFeedback(ticket.id, actionContent);
          break;
        case 'revision':
          await api.addRevision(ticket.id, actionContent);
          break;
        case 'accept':
          await api.acceptTicket(ticket.id, actionContent || 'Принято');
          break;
      }
      setActionContent('');
      await fetchTicket();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Загрузка...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>;
  if (!ticket) return null;

  const canFeedback = user.role === 'teacher' && ticket.teacher_id === user.id && ticket.status !== 'COMPLETED';
  const canAccept = user.role === 'teacher' && ticket.teacher_id === user.id && ticket.status === 'AWAITING_TEACHER';
  const canRevise = user.role === 'student' && ticket.student_id === user.id && ticket.status === 'AWAITING_STUDENT';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-primary hover:underline mb-4 inline-block">
        ← Назад
      </button>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Задание #{ticket.id}</h1>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          <div>Ученик ID: {ticket.student_id}</div>
          <div>Учитель ID: {ticket.teacher_id}</div>
          <div>Создано: {new Date(ticket.created_at).toLocaleString()}</div>
          <div>Обновлено: {new Date(ticket.updated_at).toLocaleString()}</div>
            {ticket.status !== 'COMPLETED' && (
            <div className="font-medium text-gray-700">
            Осталось циклов до автозакрытия: {ticket.count}
            </div>
            )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">История взаимодействий</h3>
        <EntryList entries={ticket.entries || []} />
      </div>

      {(canFeedback || canAccept || canRevise) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Действие</h3>
          {canFeedback && (
            <div className="space-y-2">
              <textarea
                value={actionContent}
                onChange={(e) => setActionContent(e.target.value)}
                placeholder="Введите комментарий или замечание..."
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction('feedback')}
                  disabled={submitting || !actionContent.trim()}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  Отправить замечание
                </button>
                {canAccept && (
                  <button
                    onClick={() => handleAction('accept')}
                    disabled={submitting}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Принять задание
                  </button>
                )}
              </div>
            </div>
          )}
          {canRevise && (
            <div className="space-y-2">
              <textarea
                value={actionContent}
                onChange={(e) => setActionContent(e.target.value)}
                placeholder="Опишите, что вы исправили..."
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
              <button
                onClick={() => handleAction('revision')}
                disabled={submitting || !actionContent.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Отправить доработку
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
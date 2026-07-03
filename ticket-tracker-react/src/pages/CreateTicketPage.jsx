import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function CreateTicketPage() {
  const [teacherId, setTeacherId] = useState('');
  const [content, setContent] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await api.getTeachers();
        setTeachers(data);
        if (data.length > 0) {
          setTeacherId(data[0].id.toString());  // выбираем первого по умолчанию
        }
      } catch (err) {
        setError('Не удалось загрузить список учителей');
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      setError('Выберите учителя');
      return;
    }
    setPending(true);
    setError('');
    try {
      await api.createTicket({ teacher_id: parseInt(teacherId), content });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6">Новое задание</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Учитель</label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">-- Выберите учителя --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.email} (ID: {t.id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Текст задания</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={5}
            required
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {pending ? 'Создание...' : 'Создать задание'}
        </button>
      </form>
    </div>
  );
}
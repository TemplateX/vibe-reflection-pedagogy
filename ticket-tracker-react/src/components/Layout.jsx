import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">📚 Учебный трекер</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.role === 'student' ? '👨‍🎓 Ученик' : '👩‍🏫 Учитель'}: {user?.email}
            </span>
            <button
              onClick={logout}
              className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <Outlet />
      </main>
    </div>
  );
}
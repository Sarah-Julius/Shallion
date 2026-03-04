import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Shallion</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">Welcome, {user?.username}!</span>
          <button
            onClick={() => nav('/payment')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Make Payment
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-600">You are logged in as <strong>{user?.username}</strong></p>
          <p className="text-gray-600">Email: <strong>{user?.email}</strong></p>
        </div>
      </div>
    </div>
  );
}

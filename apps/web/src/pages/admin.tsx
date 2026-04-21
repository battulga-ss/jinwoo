import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  role: string;
  isActive: boolean;
  isPremium: boolean;
  avatar: string | null;
}

const BG = 'url(https://w.wallhaven.cc/full/2y/wallhaven-2ym7v9.jpg)';

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch {
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/active`);
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const handleTogglePremium = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/premium`);
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: BG,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-75" />
        <div className="relative z-10 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: BG,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-80" />

      <div className="relative z-10">
        {/* Navbar */}
        <div className="border-b border-white border-opacity-10 px-8 py-4 flex justify-between items-center backdrop-blur-sm bg-black bg-opacity-20">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-1 rounded-lg bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-20">
              ADMIN
            </span>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-red-600 transition text-gray-300 hover:text-white"
          >
            Log out
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Total Users
              </p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Active
              </p>
              <p className="text-3xl font-bold text-green-400">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Premium
              </p>
              <p className="text-3xl font-bold text-yellow-400">
                {users.filter((u) => u.isPremium).length}
              </p>
            </div>
          </div>

          {/* Users table */}
          <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white border-opacity-10">
              <h2 className="font-semibold">Users — {users.length}</h2>
            </div>
            <div className="flex flex-col">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-6 py-4 border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{user.name}</p>
                        {user.role === 'ADMIN' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 bg-opacity-20 text-red-400">
                            Admin
                          </span>
                        )}
                        {user.isPremium && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500 bg-opacity-20 text-yellow-400">
                            Premium
                          </span>
                        )}
                        {!user.isActive && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-500 bg-opacity-20 text-gray-400">
                            Banned
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-xs text-gray-400">
                        Level {user.level}
                      </p>
                      <p className="text-xs text-gray-500">{user.xp} XP</p>
                    </div>

                    {user.role !== 'ADMIN' && (
                      <>
                        <button
                          onClick={() => handleTogglePremium(user.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                            user.isPremium
                              ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-500 border-opacity-20 hover:bg-opacity-30'
                              : 'bg-white bg-opacity-5 text-gray-400 border-white border-opacity-10 hover:bg-opacity-10'
                          }`}
                        >
                          {user.isPremium ? '⭐ Premium' : 'Set Premium'}
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                            user.isActive
                              ? 'bg-red-500 bg-opacity-10 text-red-400 border-red-500 border-opacity-20 hover:bg-opacity-20'
                              : 'bg-green-500 bg-opacity-10 text-green-400 border-green-500 border-opacity-20 hover:bg-opacity-20'
                          }`}
                        >
                          {user.isActive ? 'Ban' : 'Unban'}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500 bg-opacity-10 text-red-400 border border-red-500 border-opacity-20 hover:bg-opacity-20 transition"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

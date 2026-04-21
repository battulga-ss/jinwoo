import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  avatar: string | null;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  stats: {
    str: number;
    agi: number;
    int: number;
    phy: number;
  } | null;
}

const statConfig = {
  str: { label: 'Strength', color: 'from-red-500 to-red-700', icon: '⚔️' },
  agi: { label: 'Agility', color: 'from-green-500 to-green-700', icon: '💨' },
  int: {
    label: 'Intelligence',
    color: 'from-blue-500 to-blue-700',
    icon: '🧠',
  },
  phy: {
    label: 'Physique',
    color: 'from-orange-500 to-orange-700',
    icon: '🛡️',
  },
};

const BG = 'url(https://w.wallhaven.cc/full/2y/wallhaven-2ym7v9.jpg)';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editError, setEditError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        setUser(res.data.data);
        setEditForm({ name: res.data.data.name, email: res.data.data.email });
      } catch (e: any) {
        if (e.response?.status === 401) window.location.href = '/';
        setError('error fetching profile');
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser((prev) =>
        prev ? { ...prev, avatar: res.data.data.avatarUrl } : prev
      );
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error uploading avatar');
    }
  };

  const handleUpdateProfile = async () => {
    setEditError('');
    try {
      const res = await api.patch('/profile', editForm);
      setUser((prev) => (prev ? { ...prev, ...res.data.data } : prev));
      setIsEditing(false);
    } catch (e: any) {
      setEditError(e.response?.data?.message || 'Error updating profile');
    }
  };

  if (!user)
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

  const currentXp = user.xp % 500;
  const progressPercent = (currentXp / 500) * 100;
  const premiumDaysLeft = user.premiumExpiresAt
    ? Math.ceil(
        (new Date(user.premiumExpiresAt).getTime() - Date.now()) /
          1000 /
          60 /
          60 /
          24
      )
    : 0;

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
      <div className="absolute inset-0 bg-black bg-opacity-75" />

      <div className="relative z-10">
        {/* Top navbar */}
        <div className="border-b border-white border-opacity-10 px-8 py-4 flex justify-between items-center backdrop-blur-sm bg-black bg-opacity-20">
          <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = '/quests')}
              className="text-sm px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition"
            >
              Quests
            </button>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-red-600 transition text-gray-300 hover:text-white"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-8 py-10 flex flex-col gap-6">
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Premium banner */}
          {!user.isPremium && (
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-yellow-400 font-medium text-sm">
                    Free account
                  </p>
                  <p className="text-gray-400 text-xs">
                    Upgrade to Premium to create & complete quests
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile card */}
          <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white border-opacity-10">
            {/* Banner */}
            <div
              className={`h-32 ${
                user.isPremium
                  ? 'bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'
              }`}
            />

            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="flex items-end justify-between -mt-12 mb-6">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-36 h-36 rounded-2xl object-cover border-4 border-gray-900"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-5xl font-bold border-4 border-gray-900">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-xs font-medium">
                      Change
                    </span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm px-4 py-2 rounded-lg border border-white border-opacity-20 hover:border-opacity-40 transition"
                >
                  {isEditing ? 'Cancel' : 'Edit profile'}
                </button>
              </div>

              {/* Name & badges */}
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.isPremium && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500 border-opacity-20 font-medium">
                    ⭐ Premium
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-1">{user.email}</p>
              {user.isPremium && premiumDaysLeft > 0 && (
                <p className="text-yellow-500 text-xs mb-6">
                  Premium expires in {premiumDaysLeft} day
                  {premiumDaysLeft !== 1 ? 's' : ''}
                </p>
              )}
              {!user.isPremium && <div className="mb-6" />}

              {/* Edit form */}
              {isEditing && (
                <div className="mb-6 p-4 bg-white bg-opacity-5 rounded-xl flex flex-col gap-3">
                  <input
                    className="bg-white bg-opacity-10 text-white p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <input
                    className="bg-white bg-opacity-10 text-white p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                  {editError && (
                    <p className="text-red-400 text-sm">{editError}</p>
                  )}
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-sm font-medium transition"
                  >
                    Save changes
                  </button>
                </div>
              )}

              {/* Level & XP */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white bg-opacity-5 rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Level
                  </p>
                  <p className="text-3xl font-bold">{user.level}</p>
                </div>
                <div className="bg-white bg-opacity-5 rounded-xl p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Experience
                  </p>
                  <p className="text-3xl font-bold">
                    {currentXp}{' '}
                    <span className="text-gray-500 text-lg">/ 500</span>
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    user.isPremium
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-gray-500 text-xs mt-1 text-right">
                {progressPercent.toFixed(0)}% to next level
              </p>
            </div>
          </div>

          {/* Stats */}
          {user.stats && (
            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-10">
              <h3 className="text-sm uppercase tracking-wide text-gray-400 mb-4">
                Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(user.stats).map(([key, value]) => {
                  const config = statConfig[key as keyof typeof statConfig];
                  return (
                    <div
                      key={key}
                      className="bg-white bg-opacity-5 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-lg`}
                      >
                        {config.icon}
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">{config.label}</p>
                        <p className="text-white text-xl font-bold">{value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

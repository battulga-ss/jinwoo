import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

interface Reward {
  xp: number;
  str: number;
  agi: number;
  int: number;
  phy: number;
}

interface Quest {
  id: string;
  title: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  type: 'DAILY' | 'NORMAL';
  reward: Reward;
  createdAt: string;
}

interface ToastData {
  message: string;
  type: 'success' | 'info' | 'warning';
}

const BG = 'url(https://w.wallhaven.cc/full/2y/wallhaven-2ym7v9.jpg)';

function Toast({
  message,
  type,
  onClose,
}: ToastData & { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-green-500 bg-opacity-10 border-green-500 text-green-400',
    info: 'bg-blue-500 bg-opacity-10 border-blue-500 text-blue-400',
    warning: 'bg-yellow-500 bg-opacity-10 border-yellow-500 text-yellow-400',
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 border rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg ${styles[type]}`}
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="opacity-50 hover:opacity-100 text-xs"
      >
        ✕
      </button>
    </div>
  );
}

const rewardConfig = {
  xp: {
    label: 'XP',
    color:
      'bg-yellow-500 bg-opacity-10 text-yellow-400 border-yellow-500 border-opacity-20',
  },
  str: {
    label: 'STR',
    color:
      'bg-red-500 bg-opacity-10 text-red-400 border-red-500 border-opacity-20',
  },
  agi: {
    label: 'AGI',
    color:
      'bg-green-500 bg-opacity-10 text-green-400 border-green-500 border-opacity-20',
  },
  int: {
    label: 'INT',
    color:
      'bg-blue-500 bg-opacity-10 text-blue-400 border-blue-500 border-opacity-20',
  },
  phy: {
    label: 'PHY',
    color:
      'bg-orange-500 bg-opacity-10 text-orange-400 border-orange-500 border-opacity-20',
  },
};

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [form, setForm] = useState({
    title: '',
    type: 'DAILY',
    reward: { xp: 0, str: 0, agi: 0, int: 0, phy: 0 },
  });
  const [editForm, setEditForm] = useState({
    title: '',
    type: 'DAILY' as 'DAILY' | 'NORMAL',
    reward: { xp: 0, str: 0, agi: 0, int: 0, phy: 0 },
  });

  const showToast = useCallback(
    (message: string, type: ToastData['type'] = 'success') => {
      setToast({ message, type });
    },
    []
  );

  const hideToast = useCallback(() => setToast(null), []);

  const fetchQuests = useCallback(
    async (currentQuests: Quest[] = []) => {
      try {
        const [questRes, profileRes] = await Promise.all([
          api.get('/quest'),
          api.get('/profile'),
        ]);
        const newQuests: Quest[] = questRes.data.data;
        setIsPremium(profileRes.data.data.isPremium);

        if (currentQuests.length > 0) {
          const resetCount = newQuests.filter(
            (q) =>
              q.type === 'DAILY' &&
              q.status === 'PENDING' &&
              currentQuests.find(
                (old) => old.id === q.id && old.status === 'COMPLETED'
              )
          ).length;
          if (resetCount > 0)
            showToast(`${resetCount} daily quest(s) reset! 🔄`, 'info');
        }

        setQuests(newQuests);
      } catch {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleCreate = async () => {
    try {
      await api.post('/quest/create', form);
      setShowForm(false);
      setForm({
        title: '',
        type: 'DAILY',
        reward: { xp: 0, str: 0, agi: 0, int: 0, phy: 0 },
      });
      fetchQuests(quests);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error creating quest', 'warning');
    }
  };

  const handleComplete = async (questId: string) => {
    try {
      await api.post(`/quest/complete/${questId}`);
      showToast('Quest completed! 🎉', 'success');
      const profileRes = await api.get('/profile');
      const newLevel = profileRes.data.data.level;
      if (prevLevel !== null && newLevel > prevLevel) {
        showToast(`Level up! You are now level ${newLevel} 🚀`, 'info');
      }
      setPrevLevel(newLevel);
      fetchQuests(quests);
    } catch (e: any) {
      showToast(
        e.response?.data?.message || 'Error completing quest',
        'warning'
      );
    }
  };

  const handleDelete = async (questId: string) => {
    try {
      await api.delete(`/quest/${questId}`);
      showToast('Quest deleted', 'info');
      fetchQuests(quests);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error deleting quest', 'warning');
    }
  };

  const handleEditOpen = (quest: Quest) => {
    setEditingQuest(quest);
    setEditForm({
      title: quest.title,
      type: quest.type,
      reward: { ...quest.reward },
    });
  };

  const handleEditSave = async () => {
    if (!editingQuest) return;
    try {
      await api.patch(`/quest/${editingQuest.id}`, editForm);
      showToast('Quest updated', 'success');
      setEditingQuest(null);
      fetchQuests(quests);
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error updating quest', 'warning');
    }
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

  const pending = quests.filter((q) => q.status === 'PENDING');
  const completed = quests.filter((q) => q.status === 'COMPLETED');

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
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}

        {/* Edit Modal */}
        {editingQuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black bg-opacity-60"
              onClick={() => setEditingQuest(null)}
            />
            <div className="relative bg-gray-900 border border-white border-opacity-10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-3">
              <h2 className="text-white font-semibold mb-1">Edit Quest</h2>
              <input
                className="bg-white bg-opacity-10 text-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-white border-opacity-10"
                placeholder="Quest title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
              <select
                className="bg-white bg-opacity-10 text-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-white border-opacity-10"
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    type: e.target.value as 'DAILY' | 'NORMAL',
                  })
                }
              >
                <option value="DAILY" className="bg-gray-900">
                  Daily
                </option>
                <option value="NORMAL" className="bg-gray-900">
                  Normal
                </option>
              </select>

              <p className="text-gray-400 text-xs uppercase tracking-wide">
                Rewards
              </p>
              <div className="grid grid-cols-5 gap-2">
                {(['xp', 'str', 'agi', 'int', 'phy'] as const).map((stat) => (
                  <div key={stat}>
                    <p className="text-gray-500 text-xs text-center mb-1 uppercase">
                      {stat}
                    </p>
                    <input
                      type="number"
                      className="w-full bg-white bg-opacity-10 text-white p-2 rounded-lg text-center text-sm border border-white border-opacity-10 outline-none focus:ring-2 focus:ring-blue-500"
                      value={editForm.reward[stat]}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          reward: {
                            ...editForm.reward,
                            [stat]: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setEditingQuest(null)}
                  className="flex-1 bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-3 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-sm font-medium transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navbar */}
        <div className="border-b border-white border-opacity-10 px-8 py-4 flex justify-between items-center backdrop-blur-sm bg-black bg-opacity-20">
          <h1 className="text-xl font-semibold tracking-tight">Quests</h1>
          <div className="flex gap-3">
            <button
              onClick={() => (window.location.href = '/profile')}
              className="text-sm px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition"
            >
              Profile
            </button>
            {isPremium && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium"
              >
                + New Quest
              </button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-8 flex flex-col gap-6">
          {/* Premium lock banner */}
          {!isPremium && (
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-2xl p-6 text-center">
              <p className="text-4xl mb-3">🔒</p>
              <p className="text-yellow-400 font-semibold mb-1">
                Premium Required
              </p>
              <p className="text-gray-400 text-sm">
                Contact admin to upgrade your account to Premium and unlock
                quests.
              </p>
            </div>
          )}

          {/* Create Form */}
          {isPremium && showForm && (
            <div className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-6 flex flex-col gap-3">
              <h2 className="text-white font-semibold mb-1">New Quest</h2>
              <input
                className="bg-white bg-opacity-10 text-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-white border-opacity-10 placeholder-gray-500"
                placeholder="Quest title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <select
                className="bg-white bg-opacity-10 text-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-white border-opacity-10"
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as 'DAILY' | 'NORMAL',
                  })
                }
              >
                <option value="DAILY" className="bg-gray-900">
                  Daily
                </option>
                <option value="NORMAL" className="bg-gray-900">
                  Normal
                </option>
              </select>

              <p className="text-gray-400 text-xs uppercase tracking-wide">
                Rewards
              </p>
              <div className="grid grid-cols-5 gap-2">
                {(['xp', 'str', 'agi', 'int', 'phy'] as const).map((stat) => (
                  <div key={stat}>
                    <p className="text-gray-500 text-xs text-center mb-1 uppercase">
                      {stat}
                    </p>
                    <input
                      type="number"
                      className="w-full bg-white bg-opacity-10 text-white p-2 rounded-lg text-center text-sm border border-white border-opacity-10 outline-none focus:ring-2 focus:ring-blue-500"
                      value={form.reward[stat]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          reward: {
                            ...form.reward,
                            [stat]: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl text-sm font-medium transition mt-1"
              >
                Create Quest
              </button>
            </div>
          )}

          {/* Pending Quests */}
          {isPremium && pending.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">
                Active — {pending.length}
              </p>
              <div className="flex flex-col gap-3">
                {pending.map((quest) => (
                  <div
                    key={quest.id}
                    className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-5"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-white font-semibold">
                          {quest.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full w-fit border ${
                            quest.type === 'DAILY'
                              ? 'bg-blue-500 bg-opacity-10 text-blue-400 border-blue-500 border-opacity-20'
                              : 'bg-purple-500 bg-opacity-10 text-purple-400 border-purple-500 border-opacity-20'
                          }`}
                        >
                          {quest.type === 'DAILY' ? 'Daily' : 'Normal'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditOpen(quest)}
                          className="text-xs px-2 py-1 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(quest.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-500 bg-opacity-10 hover:bg-opacity-20 text-red-400 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-4">
                      {(
                        Object.entries(quest.reward) as [
                          keyof typeof rewardConfig,
                          number
                        ][]
                      )
                        .filter(([, v]) => v > 0)
                        .map(([key, value]) => (
                          <span
                            key={key}
                            className={`text-xs px-2 py-1 rounded-lg border ${rewardConfig[key].color}`}
                          >
                            +{value} {rewardConfig[key].label}
                          </span>
                        ))}
                    </div>

                    <button
                      onClick={() => handleComplete(quest.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white p-2.5 rounded-xl text-sm font-medium transition"
                    >
                      Mark as complete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Quests */}
          {isPremium && completed.length > 0 && (
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">
                Completed — {completed.length}
              </p>
              <div className="flex flex-col gap-3">
                {completed.map((quest) => (
                  <div
                    key={quest.id}
                    className="bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-10 rounded-2xl p-5 opacity-50"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-white font-semibold line-through">
                          {quest.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full w-fit border ${
                            quest.type === 'DAILY'
                              ? 'bg-blue-500 bg-opacity-10 text-blue-400 border-blue-500 border-opacity-20'
                              : 'bg-purple-500 bg-opacity-10 text-purple-400 border-purple-500 border-opacity-20'
                          }`}
                        >
                          {quest.type === 'DAILY' ? 'Daily' : 'Normal'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-400 text-xs font-medium">
                          ✅ Done
                        </span>
                        <button
                          onClick={() => handleDelete(quest.id)}
                          className="text-xs px-2 py-1 rounded-lg bg-red-500 bg-opacity-10 hover:bg-opacity-20 text-red-400 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPremium && quests.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm">
                No quests yet. Create your first quest!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

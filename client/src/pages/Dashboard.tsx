import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { billsApi, Bill } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBills();
  }, [user, navigate]);

  const fetchBills = async () => {
    try {
      const res = await billsApi.getAll();
      setBills(res.data.bills);
    } catch {
      console.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTick = async (billId: string, userId: string) => {
    try {
      await billsApi.toggleTick(billId, userId);
      fetchBills();
    } catch {
      console.error('Failed to toggle tick');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const getTickCount = (bill: Bill) => {
    return bill.users.filter(u => u.ticked).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">19</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Room 1919
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-gray-700 font-medium hidden sm:block">Xin chào, {user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Danh sách Bills</h2>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi các khoản chi</p>
          </div>
          <Link
            to="/create-bill"
            className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo Bill mới
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4">Đang tải...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && bills.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có bill nào</h3>
            <p className="text-gray-500 mb-6">Tạo bill đầu tiên để bắt đầu</p>
            <Link to="/create-bill" className="btn-secondary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Bill mới
            </Link>
          </div>
        )}

        {/* Bills Grid */}
        {!loading && bills.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bills.map((bill) => (
              <div key={bill.id} className="card hover:shadow-xl transition-shadow duration-300">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white truncate">{bill.title}</h3>
                      <p className="text-indigo-100 text-sm mt-1">
                        Người tạo: {bill.creator.name}
                      </p>
                    </div>
                    <div className="bg-white/20 rounded-lg px-3 py-1">
                      <span className="text-white text-sm font-medium">
                        {getTickCount(bill)}/{bill.users.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold text-indigo-600">
                      {formatAmount(bill.amount)}
                      <span className="text-lg text-gray-400 ml-1">đ</span>
                    </span>
                    <span className="badge badge-success">
                      {getTickCount(bill) === bill.users.length ? 'Hoàn tất' : 'Đang chờ'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">
                    {formatDate(bill.created_at)}
                  </p>

                  {/* Users List */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Người tham gia:</h4>
                    <div className="space-y-2">
                      {bill.users.map((u) => (
                        <label
                          key={u.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            u.ticked ? 'bg-emerald-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            u.ticked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                          }`}>
                            {u.ticked && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={u.ticked}
                            onChange={() => handleToggleTick(bill.id, u.id)}
                            className="sr-only"
                          />
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${u.ticked ? 'text-emerald-700' : 'text-gray-700'}`}>
                              {u.name}
                            </span>
                            {u.ticked && u.ticked_at && (
                              <span className="text-xs text-emerald-500 block">
                                Đã xác nhận {formatDate(u.ticked_at)}
                              </span>
                            )}
                          </div>
                          {u.id === user?.id && (
                            <span className="badge badge-warning text-xs">Bạn</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
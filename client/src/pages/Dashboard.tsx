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
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Finance 1919</h1>
        <div className="flex items-center gap-4">
          <span>Xin chào, {user?.name}</span>
          <button onClick={logout} className="text-red-500">Logout</button>
        </div>
      </nav>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Danh sách Bills</h2>
          <Link to="/create-bill" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            + Tạo Bill mới
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : bills.length === 0 ? (
          <p className="text-gray-500">Chưa có bill nào</p>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{bill.title}</h3>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(bill.amount)}</p>
                    <p className="text-sm text-gray-500">
                      Người tạo: {bill.creator.name} - {formatDate(bill.created_at)}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Người trong bill:</h4>
                  {bill.users && bill.users.length > 0 ? (
                    <div className="space-y-2">
                      {bill.users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={u.ticked}
                            onChange={() => handleToggleTick(bill.id, u.id)}
                            className="w-5 h-5"
                          />
                          <span>{u.name}</span>
                          {u.ticked && u.ticked_at && (
                            <span className="text-sm text-gray-500">
                              (đã xác nhận {formatDate(u.ticked_at)})
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Đang tải danh sách...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
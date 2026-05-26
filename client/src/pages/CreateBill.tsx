import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function CreateBill() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await billsApi.create(title, parseFloat(amount));
      navigate('/dashboard');
    } catch {
      setError('Failed to create bill');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">Tạo Bill mới</h1>
      </nav>

      <div className="p-8 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6">Tạo Bill mới</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block mb-2 font-medium">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="VD: Cơm trưa 15/5"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Số tiền (VNĐ)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="VD: 150000"
              min="0"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Tạo Bill
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
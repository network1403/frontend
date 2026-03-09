// LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('أكمل البيانات');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('مرحباً بك!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'بيانات غير صحيحة');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-7 animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-1">تسجيل الدخول</h2>
      <p className="text-slate-500 text-sm mb-6">مرحباً بعودتك إلى QuizZer</p>
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">البريد الإلكتروني</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="example@email.com"
            className="input-field"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">كلمة المرور</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="input-field pl-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          دخول
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-5">
        ليس لديك حساب؟{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">إنشاء حساب</Link>
      </p>
    </div>
  );
}

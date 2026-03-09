import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', display_name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (!form.username || !form.display_name || !form.email || !form.password)
      return toast.error('أكمل جميع الحقول');
    if (form.username.length < 3) return toast.error('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) return toast.error('اسم المستخدم: أحرف إنجليزية وأرقام و _ فقط');
    if (form.password.length < 8) return toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');

    setLoading(true);
    try {
      await register(form);
      toast.success('مرحباً! تم إنشاء حسابك 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  return (
    <div className="card p-7 animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-1">إنشاء حساب جديد</h2>
      <p className="text-slate-500 text-sm mb-6">انضم إلى مجتمع QuizZer</p>
      <form onSubmit={handle} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">الاسم المعروض</label>
            <input
              type="text"
              value={form.display_name}
              onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
              placeholder="اسمك الكامل"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">اسم المستخدم</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value.toLowerCase() }))}
              placeholder="username"
              className="input-field"
              dir="ltr"
            />
          </div>
        </div>
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
              placeholder="8 أحرف على الأقل"
              className="input-field pl-10"
            />
            <button type="button" onClick={() => setShow(!show)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          إنشاء الحساب
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-5">
        لديك حساب بالفعل؟{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">تسجيل الدخول</Link>
      </p>
    </div>
  );
}

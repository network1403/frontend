import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { Settings, Save, Loader2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ display_name: user?.display_name || '', bio: user?.bio || '' });

  const saveMutation = useMutation({
    mutationFn: (data) => api.put('/users/me/profile', data),
    onSuccess: ({ data }) => {
      updateUser(data);
      toast.success('تم حفظ التغييرات');
    },
    onError: () => toast.error('فشل الحفظ'),
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings size={20} /> الإعدادات</h1>
      <div className="space-y-4">
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-4">الملف الشخصي</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">الاسم المعروض</label>
              <input type="text" value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">نبذة تعريفية</label>
              <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3} className="input-field resize-none" placeholder="عرّف بنفسك..." />
            </div>
            <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="btn-primary flex items-center gap-2">
              {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              حفظ
            </button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-white mb-2">الحساب</h2>
          <p className="text-sm text-slate-500">البريد: <span className="text-slate-300">{user?.email}</span></p>
          <p className="text-sm text-slate-500 mt-1">اسم المستخدم: <span className="text-slate-300 font-mono">@{user?.username}</span></p>
        </div>
      </div>
    </div>
  );
}

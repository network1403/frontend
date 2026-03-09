// ProfilePage.jsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, MapPin, Calendar, Users, BarChart3, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import QuestionCard from '../components/question/QuestionCard';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import clsx from 'clsx';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: me, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState('questions');

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => api.get(`/users/${username}`).then(r => r.data),
  });

  const { data: questions, isLoading: qLoading } = useQuery({
    queryKey: ['user-questions', username],
    queryFn: () => api.get(`/users/${username}/questions`).then(r => r.data.questions),
    enabled: tab === 'questions',
  });

  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${profile.user_id}/follow`),
    onSuccess: () => refetch(),
    onError: () => toast.error('حدث خطأ'),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-400" size={32} /></div>;
  if (!profile) return <div className="text-center py-12 text-slate-500">المستخدم غير موجود</div>;

  const isMe = me?.user_id === profile.user_id;

  return (
    <div className="animate-fade-in">
      {/* Cover */}
      <div className="h-36 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 mb-0 overflow-hidden">
        {profile.cover_url && <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />}
      </div>

      {/* Profile header */}
      <div className="card p-5 -mt-8 mx-0 mb-4 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 border-4 border-surface-50 overflow-hidden -mt-12 flex items-center justify-center flex-shrink-0">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold text-white">{profile.display_name?.[0]}</span>
            }
          </div>
          {!isMe && isAuthenticated && (
            <button
              onClick={() => followMutation.mutate()}
              className={clsx(
                'px-5 py-2 rounded-xl text-sm font-medium transition-all mt-2',
                profile.is_following
                  ? 'bg-surface-200 text-white hover:bg-red-500/10 hover:text-red-400 border border-white/10'
                  : 'btn-primary'
              )}
            >
              {profile.is_following ? 'إلغاء المتابعة' : 'متابعة'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-white">{profile.display_name}</h1>
          {profile.is_verified && <CheckCircle2 size={18} className="text-brand-400" />}
        </div>
        <p className="text-slate-500 text-sm mb-3">@{profile.username}</p>
        {profile.bio && <p className="text-slate-300 text-sm mb-3 leading-relaxed">{profile.bio}</p>}

        <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
          <Calendar size={12} />
          <span>انضم {formatDistanceToNow(new Date(profile.created_at), { locale: ar, addSuffix: true })}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'سؤال', value: profile.total_questions },
            { label: 'متابع', value: profile.followers_count },
            { label: 'يتابع', value: profile.following_count },
            { label: 'دقة', value: `${profile.accuracy}%` },
          ].map(s => (
            <div key={s.label} className="bg-surface-100 rounded-xl py-2.5">
              <div className="font-bold text-white text-sm">{s.value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 mb-4">
        {['questions'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={clsx('flex-1 py-3 text-sm font-medium transition-colors border-b-2',
              tab === t ? 'text-white border-brand-500' : 'text-slate-500 border-transparent hover:text-slate-300'
            )}>
            الأسئلة
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {qLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-400" size={24} /></div>}
        {questions?.map(q => <QuestionCard key={q.question_id} question={{ ...q, username: profile.username, display_name: profile.display_name, avatar_url: profile.avatar_url, is_verified: profile.is_verified }} />)}
        {!qLoading && questions?.length === 0 && <div className="text-center py-12 text-slate-500">لا توجد أسئلة بعد</div>}
      </div>
    </div>
  );
}

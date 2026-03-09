// ExplorePage.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Loader2 } from 'lucide-react';
import api from '../lib/api';
import QuestionCard from '../components/question/QuestionCard';
import { Link } from 'react-router-dom';

export default function ExplorePage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('questions');

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.get('/feed/trending').then(r => r.data),
  });

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', q, type],
    queryFn: () => api.get(`/search?q=${encodeURIComponent(q)}&type=${type}`).then(r => r.data),
    enabled: q.trim().length >= 2,
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">استكشاف</h1>
      <div className="relative mb-6">
        <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="ابحث عن أسئلة أو مستخدمين..."
          className="input-field pr-12"
        />
      </div>

      {!q && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <TrendingUp size={16} /> <span className="text-sm font-medium">الأسئلة الرائجة</span>
          </div>
          <div className="space-y-4">
            {trending?.questions?.map(q => <QuestionCard key={q.question_id} question={q} />)}
          </div>
        </div>
      )}

      {q.length >= 2 && (
        <div className="space-y-4">
          {isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin text-brand-400" size={24} /></div>}
          {results?.results?.length === 0 && <div className="text-center py-12 text-slate-500">لا نتائج لـ "{q}"</div>}
          {results?.type === 'questions' && results?.results?.map(q => <QuestionCard key={q.question_id} question={q} />)}
          {results?.type === 'users' && results?.results?.map(u => (
            <Link key={u.user_id} to={`/${u.username}`} className="card p-4 flex items-center gap-3 hover:border-white/10 transition-colors block">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-sm">{u.display_name?.[0]}</span>
              </div>
              <div>
                <div className="font-medium text-white text-sm">{u.display_name}</div>
                <div className="text-slate-500 text-xs">@{u.username} · {u.followers_count} متابع</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

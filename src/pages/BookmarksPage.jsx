import { useQuery } from '@tanstack/react-query';
import { Bookmark, Loader2 } from 'lucide-react';
import api from '../lib/api';
import QuestionCard from '../components/question/QuestionCard';

export default function BookmarksPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => api.get('/users/me/bookmarks').then(r => r.data),
  });

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Bookmark size={20} /> المحفوظات
      </h1>
      {isLoading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-400" size={24} /></div>}
      {error && <div className="text-center py-12 text-slate-500">حدث خطأ في تحميل المحفوظات</div>}
      <div className="space-y-4">
        {data?.questions?.map(q => <QuestionCard key={q.question_id} question={q} />)}
        {!isLoading && !error && (!data?.questions || data.questions.length === 0) && (
          <div className="text-center py-12 text-slate-500">
            <Bookmark size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="font-medium text-slate-400 mb-1">لا أسئلة محفوظة بعد</p>
            <p className="text-sm">احفظ الأسئلة التي تريد العودة إليها</p>
          </div>
        )}
      </div>
    </div>
  );
}

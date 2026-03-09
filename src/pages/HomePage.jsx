import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import QuestionCard from '../components/question/QuestionCard';
import api from '../lib/api';
import { Loader2, Sparkles, Users } from 'lucide-react';
import clsx from 'clsx';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState(isAuthenticated ? 'following' : 'foryou');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['feed', tab, selectedCategory],
    queryFn: ({ pageParam = 1 }) => {
      const endpoint = tab === 'following' ? '/feed/following' : '/feed/for-you';
      const params = new URLSearchParams({ page: pageParam, limit: 15 });
      if (selectedCategory) params.append('category_id', selectedCategory);
      return api.get(`${endpoint}?${params}`).then(r => r.data);
    },
    getNextPageParam: (last, all) => last.questions.length === 15 ? all.length + 1 : undefined,
    initialPageParam: 1,
  });

  const questions = data?.pages.flatMap(p => p.questions) ?? [];

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-white/5 mb-6 sticky top-14 lg:top-0 bg-surface/95 backdrop-blur-sm z-20 -mx-4 px-4">
        {isAuthenticated && (
          <button
            onClick={() => setTab('following')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors border-b-2',
              tab === 'following'
                ? 'text-white border-brand-500'
                : 'text-slate-500 hover:text-slate-300 border-transparent'
            )}
          >
            <Users size={16} />
            المتابَعون
          </button>
        )}
        <button
          onClick={() => setTab('foryou')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors border-b-2',
            tab === 'foryou'
              ? 'text-white border-brand-500'
              : 'text-slate-500 hover:text-slate-300 border-transparent'
          )}
        >
          <Sparkles size={16} />
          لك
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand-400" size={32} />
          </div>
        )}

        {isError && (
          <div className="text-center py-12 text-slate-500">
            <p>حدث خطأ في تحميل التغذية الراجعة</p>
          </div>
        )}

        {!isLoading && questions.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Sparkles size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="font-medium text-white mb-2">لا توجد أسئلة بعد</p>
            <p className="text-sm">
              {tab === 'following'
                ? 'ابدأ بمتابعة بعض المستخدمين لترى أسئلتهم هنا'
                : 'كن أول من ينشر سؤالاً!'
              }
            </p>
          </div>
        )}

        {questions.map(q => (
          <QuestionCard key={q.question_id} question={q} />
        ))}

        {hasNextPage && (
          <div className="flex justify-center py-4">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              {isFetchingNextPage ? <Loader2 size={16} className="animate-spin" /> : null}
              تحميل المزيد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

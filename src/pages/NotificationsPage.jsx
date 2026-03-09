import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import api from '../lib/api';
import clsx from 'clsx';

const ICONS = {
  new_follower: '👤',
  question_answered: '✅',
  question_retweeted: '🔁',
  comment_on_question: '💬',
  comment_reply: '↩️',
  question_liked: '❤️',
  milestone: '🏆',
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries(['notifications', 'notif-count']),
  });

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell size={20} /> الإشعارات
          {data?.unread_count > 0 && (
            <span className="bg-brand-500 text-white text-xs rounded-full px-2 py-0.5">{data.unread_count}</span>
          )}
        </h1>
        {data?.unread_count > 0 && (
          <button onClick={() => readAllMutation.mutate()} className="btn-ghost text-xs flex items-center gap-1.5">
            <CheckCheck size={14} /> قراءة الكل
          </button>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-400" size={24} /></div>}

      <div className="space-y-1">
        {data?.notifications?.map(n => (
          <div key={n.notification_id} className={clsx(
            'flex items-start gap-3 p-4 rounded-xl transition-colors',
            !n.is_read ? 'bg-brand-500/5 border border-brand-500/10' : 'hover:bg-surface-100'
          )}>
            <div className="w-9 h-9 rounded-full bg-surface-200 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
              {n.actor_avatar
                ? <img src={n.actor_avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-sm">{ICONS[n.type] || '🔔'}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-300">
                {n.actor_name && <span className="font-medium text-white">{n.actor_name} </span>}
                {n.message}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {formatDistanceToNow(new Date(n.created_at), { locale: ar, addSuffix: true })}
              </div>
            </div>
            {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-2" />}
          </div>
        ))}
        {!isLoading && data?.notifications?.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Bell size={40} className="mx-auto mb-3 text-slate-600" />
            <p>لا إشعارات جديدة</p>
          </div>
        )}
      </div>
    </div>
  );
}

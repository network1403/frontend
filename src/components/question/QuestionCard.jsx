import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircle, Repeat2, Heart, Bookmark, Share2,
  CheckCircle2, XCircle, Trophy, Lightbulb, ExternalLink,
  MoreHorizontal, Trash2, Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const DIFFICULTY_CONFIG = {
  easy:   { label: 'سهل',   color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  medium: { label: 'متوسط', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  hard:   { label: 'صعب',  color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

export default function QuestionCard({ question, onUpdate }) {
  const { user, isAuthenticated } = useAuthStore();
  const [localQ, setLocalQ] = useState(question);
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const answerMutation = useMutation({
    mutationFn: (optionId) => api.post(`/questions/${localQ.question_id}/answer`, { option_id: optionId }),
    onSuccess: ({ data }) => {
      setLocalQ(prev => ({
        ...prev,
        user_answer: { selected_option_id: data.selected_option, is_correct: data.is_correct },
        correct_option: data.correct_option,
        answer_count: data.stats.answer_count,
        correct_count: data.stats.correct_count,
        options: prev.options.map(o => {
          const distItem = data.distribution.find(d => d.option_id === o.option_id);
          return distItem ? { ...o, selection_count: distItem.selection_count } : o;
        }),
        explanation: data.explanation,
        stats: data.stats,
        distribution: data.distribution,
      }));
      if (data.is_correct) toast.success('إجابة صحيحة! 🎉');
      else toast.error('إجابة خاطئة!');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'حدث خطأ'),
  });

  const likeMutation = useMutation({
    mutationFn: () => api.post(`/questions/${localQ.question_id}/like`),
    onSuccess: ({ data }) => {
      setLocalQ(prev => ({
        ...prev,
        interactions: { ...prev.interactions, liked: data.liked },
        like_count: data.liked ? prev.like_count + 1 : Math.max(0, prev.like_count - 1),
      }));
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => api.post(`/questions/${localQ.question_id}/bookmark`),
    onSuccess: ({ data }) => {
      setLocalQ(prev => ({
        ...prev,
        interactions: { ...prev.interactions, bookmarked: data.bookmarked },
        bookmark_count: data.bookmarked ? prev.bookmark_count + 1 : Math.max(0, prev.bookmark_count - 1),
      }));
      toast.success(data.bookmarked ? 'تم الحفظ' : 'تم إلغاء الحفظ');
    },
  });

  const retweetMutation = useMutation({
    mutationFn: () => api.post(`/questions/${localQ.question_id}/retweet`),
    onSuccess: ({ data }) => {
      setLocalQ(prev => ({
        ...prev,
        interactions: { ...prev.interactions, retweeted: data.retweeted },
        retweet_count: data.retweeted ? prev.retweet_count + 1 : Math.max(0, prev.retweet_count - 1),
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/questions/${localQ.question_id}`),
    onSuccess: () => {
      toast.success('تم حذف السؤال');
      queryClient.invalidateQueries(['feed']);
      if (onUpdate) onUpdate('deleted', localQ.question_id);
    },
  });

  const handleAnswer = (optionId) => {
    if (!isAuthenticated) return toast.error('يجب تسجيل الدخول للإجابة');
    if (localQ.user_answer) return;
    answerMutation.mutate(optionId);
  };

  const hasAnswered = !!localQ.user_answer;
  const totalAnswers = localQ.answer_count || 0;
  const diffConfig = DIFFICULTY_CONFIG[localQ.difficulty_label] || DIFFICULTY_CONFIG.medium;

  const getOptionClass = (opt) => {
    if (!hasAnswered) return 'option-btn';
    const isSelected = localQ.user_answer?.selected_option_id === opt.option_id;
    const isCorrect = localQ.correct_option?.option_id === opt.option_id;
    if (isCorrect) return 'option-btn correct';
    if (isSelected && !isCorrect) return 'option-btn wrong';
    return 'option-btn opacity-50';
  };

  const getOptionIcon = (opt) => {
    if (!hasAnswered) return null;
    const isSelected = localQ.user_answer?.selected_option_id === opt.option_id;
    const isCorrect = localQ.correct_option?.option_id === opt.option_id;
    if (isCorrect) return <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />;
    if (isSelected) return <XCircle size={16} className="text-red-400 flex-shrink-0" />;
    return null;
  };

  const getOptionPercent = (opt) => {
    if (!hasAnswered || totalAnswers === 0) return 0;
    return Math.round(((opt.selection_count || 0) / totalAnswers) * 100);
  };

  const timeAgo = formatDistanceToNow(new Date(localQ.created_at), { locale: ar, addSuffix: true });

  return (
    <article className="card p-5 animate-fade-in hover:border-white/10 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to={`/${localQ.username}`}>
            <div className="w-10 h-10 rounded-full bg-brand-600 overflow-hidden flex items-center justify-center flex-shrink-0">
              {localQ.avatar_url
                ? <img src={localQ.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-sm font-bold">{localQ.display_name?.[0]}</span>
              }
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link to={`/${localQ.username}`} className="font-semibold text-white hover:underline text-sm">
                {localQ.display_name}
              </Link>
              {localQ.is_verified && (
                <CheckCircle2 size={14} className="text-brand-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>@{localQ.username}</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tags */}
          {localQ.category_name && (
            <span className="text-xs text-slate-400 bg-surface-200 px-2 py-1 rounded-lg">
              {localQ.category_icon} {localQ.category_name}
            </span>
          )}
          <span className={clsx('text-xs px-2 py-1 rounded-lg border', diffConfig.color)}>
            {diffConfig.label}
          </span>
          {localQ.ai_generated && (
            <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20">
              ✨ AI
            </span>
          )}

          {/* Menu */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-surface-200 text-slate-500 hover:text-white transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div className="absolute left-0 top-8 bg-surface-100 border border-white/10 rounded-xl shadow-xl z-10 min-w-[140px] py-1 animate-fade-in">
                  {user?.user_id === localQ.user_id && (
                    <button
                      onClick={() => { deleteMutation.mutate(); setShowMenu(false); }}
                      className="w-full text-right px-4 py-2.5 text-sm text-red-400 hover:bg-surface-200 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> حذف
                    </button>
                  )}
                  <button
                    onClick={() => { toast.success('تم إرسال البلاغ'); setShowMenu(false); }}
                    className="w-full text-right px-4 py-2.5 text-sm text-slate-400 hover:bg-surface-200 flex items-center gap-2"
                  >
                    <Flag size={14} /> إبلاغ
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Question Text */}
      <Link to={`/question/${localQ.question_id}`}>
        <p className="text-white font-medium text-base leading-relaxed mb-4 hover:text-brand-300 transition-colors">
          {localQ.content}
        </p>
      </Link>

      {/* Options */}
      <div className="space-y-2.5 mb-4">
        {localQ.options?.map((opt) => (
          <button
            key={opt.option_id}
            onClick={() => handleAnswer(opt.option_id)}
            disabled={hasAnswered || answerMutation.isPending}
            className={clsx(getOptionClass(opt), 'relative overflow-hidden')}
          >
            {/* Progress bar (after answering) */}
            {hasAnswered && (
              <div
                className="absolute inset-0 bg-white/5 transition-all duration-700 ease-out"
                style={{ width: `${getOptionPercent(opt)}%` }}
              />
            )}
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-surface-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {opt.option_label}
                </span>
                <span>{opt.option_text}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {hasAnswered && (
                  <span className="text-xs text-slate-400">{getOptionPercent(opt)}%</span>
                )}
                {getOptionIcon(opt)}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Submit hint */}
      {!hasAnswered && isAuthenticated && (
        <p className="text-xs text-slate-600 text-center mb-3">اضغط على الخيار للإجابة</p>
      )}
      {!isAuthenticated && (
        <Link to="/login" className="block text-center text-xs text-brand-400 hover:text-brand-300 mb-3">
          سجل الدخول للإجابة على الأسئلة
        </Link>
      )}

      {/* Stats after answering */}
      {hasAnswered && localQ.stats && (
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 py-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Trophy size={12} className="text-gold-400" />
            {localQ.stats.correct_count} إجابة صحيحة
          </span>
          <span>{localQ.stats.answer_count} إجمالي</span>
          <span>
            {localQ.stats.answer_count > 0
              ? Math.round((localQ.stats.correct_count / localQ.stats.answer_count) * 100)
              : 0}% دقة
          </span>
        </div>
      )}

      {/* Explanation */}
      {hasAnswered && localQ.explanation && (
        <div className="explanation-card">
          <div className="flex items-center gap-2 mb-2.5">
            <Lightbulb size={16} className="text-green-400" />
            <span className="font-semibold text-green-400 text-sm">الشرح النموذجي</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            {localQ.explanation.explanation_text}
          </p>
          {localQ.explanation.explanation_source && (
            <a
              href={localQ.explanation.explanation_source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mt-2"
            >
              <ExternalLink size={12} />
              المصدر
            </a>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1">
          {/* Comments */}
          <Link to={`/question/${localQ.question_id}`}>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-surface-100 text-slate-500 hover:text-blue-400 transition-colors text-xs">
              <MessageCircle size={16} />
              {localQ.answer_count > 0 && <span>{localQ.answer_count}</span>}
            </button>
          </Link>

          {/* Retweet */}
          <button
            onClick={() => isAuthenticated ? retweetMutation.mutate() : toast.error('سجل الدخول أولاً')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-xs',
              localQ.interactions?.retweeted
                ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                : 'text-slate-500 hover:text-green-400 hover:bg-surface-100'
            )}
          >
            <Repeat2 size={16} />
            {localQ.retweet_count > 0 && <span>{localQ.retweet_count}</span>}
          </button>

          {/* Like */}
          <button
            onClick={() => isAuthenticated ? likeMutation.mutate() : toast.error('سجل الدخول أولاً')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 text-xs',
              localQ.interactions?.liked
                ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20 animate-pop'
                : 'text-slate-500 hover:text-red-400 hover:bg-surface-100'
            )}
          >
            <Heart size={16} className={localQ.interactions?.liked ? 'fill-current' : ''} />
            {localQ.like_count > 0 && <span>{localQ.like_count}</span>}
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={() => isAuthenticated ? bookmarkMutation.mutate() : toast.error('سجل الدخول أولاً')}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-xs',
            localQ.interactions?.bookmarked
              ? 'text-gold-400 bg-gold-400/10 hover:bg-gold-400/20'
              : 'text-slate-500 hover:text-gold-400 hover:bg-surface-100'
          )}
        >
          <Bookmark size={16} className={localQ.interactions?.bookmarked ? 'fill-current' : ''} />
        </button>
      </div>
    </article>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { PlusCircle, Trash2, Sparkles, Send, CheckCircle, Loader2, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import clsx from 'clsx';

const LABELS = ['أ', 'ب', 'ج', 'د'];
const DIFFICULTY_OPTIONS = [
  { value: 'easy',   label: 'سهل',   color: 'text-green-400' },
  { value: 'medium', label: 'متوسط', color: 'text-yellow-400' },
  { value: 'hard',   label: 'صعب',  color: 'text-red-400' },
];

const defaultOptions = () => [
  { option_text: '', is_correct: false },
  { option_text: '', is_correct: false },
];

export default function ComposePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    content: '',
    category_id: '',
    difficulty_label: 'medium',
    options: defaultOptions(),
    explanation_text: '',
    explanation_source: '',
  });
  const [aiTopic, setAiTopic] = useState('');
  const [showAI, setShowAI] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => api.post('/questions', data),
    onSuccess: (res) => {
      toast.success('تم نشر السؤال!');
      navigate(`/question/${res.data.question_id}`);
    },
    onError: (e) => toast.error(e.response?.data?.error || 'فشل النشر'),
  });

  const aiMutation = useMutation({
    mutationFn: (data) => api.post('/questions/ai-generate', data),
    onSuccess: ({ data }) => {
      setForm(prev => ({
        ...prev,
        content: data.content,
        options: data.options.map(o => ({ option_text: o.option_text, is_correct: o.is_correct })),
        explanation_text: data.explanation_text,
        explanation_source: data.explanation_source || '',
        difficulty_label: data.difficulty_label || prev.difficulty_label,
      }));
      setShowAI(false);
      toast.success('تم توليد السؤال بنجاح!');
    },
    onError: () => toast.error('فشل توليد السؤال'),
  });

  const addOption = () => {
    if (form.options.length >= 4) return toast.error('الحد الأقصى 4 خيارات');
    setForm(prev => ({ ...prev, options: [...prev.options, { option_text: '', is_correct: false }] }));
  };

  const removeOption = (i) => {
    if (form.options.length <= 2) return toast.error('الحد الأدنى خياران');
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== i).map(o => ({ ...o })),
    }));
  };

  const setCorrect = (i) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((o, idx) => ({ ...o, is_correct: idx === i })),
    }));
  };

  const handleSubmit = () => {
    if (!form.content.trim()) return toast.error('أدخل نص السؤال');
    if (form.options.some(o => !o.option_text.trim())) return toast.error('أكمل جميع الخيارات');
    if (!form.options.some(o => o.is_correct)) return toast.error('حدد الإجابة الصحيحة');
    if (!form.explanation_text.trim()) return toast.error('أدخل الشرح النموذجي');
    if (form.explanation_text.trim().length < 20) return toast.error('الشرح يجب أن يكون 20 حرفاً على الأقل');
    submitMutation.mutate(form);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">إنشاء سؤال جديد</h1>
        <button
          onClick={() => setShowAI(!showAI)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
            showAI
              ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
              : 'bg-surface-100 text-slate-400 hover:text-white border border-white/5'
          )}
        >
          <Sparkles size={16} />
          توليد بالذكاء الاصطناعي
        </button>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div className="card p-4 mb-5 border-brand-500/20 bg-brand-500/5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-brand-400" />
            <span className="text-sm font-medium text-brand-300">توليد سؤال بالذكاء الاصطناعي</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={aiTopic}
              onChange={e => setAiTopic(e.target.value)}
              placeholder="أدخل موضوع السؤال (مثال: نظام الشمس)"
              className="input-field text-sm flex-1"
              onKeyDown={e => e.key === 'Enter' && aiMutation.mutate({ topic: aiTopic, difficulty_label: form.difficulty_label })}
            />
            <button
              onClick={() => aiMutation.mutate({ topic: aiTopic, difficulty_label: form.difficulty_label })}
              disabled={!aiTopic.trim() || aiMutation.isPending}
              className="btn-primary text-sm px-4 flex items-center gap-2"
            >
              {aiMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              توليد
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* Question text */}
        <div className="card p-5">
          <label className="block text-sm font-medium text-slate-300 mb-2.5">نص السؤال *</label>
          <textarea
            value={form.content}
            onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
            placeholder="اكتب سؤالك هنا..."
            rows={3}
            className="input-field resize-none text-base"
          />
        </div>

        {/* Meta: category + difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">التصنيف</label>
            <select
              value={form.category_id}
              onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
              className="input-field text-sm py-2"
            >
              <option value="">اختر التصنيف</option>
              {categories?.map(c => (
                <option key={c.category_id} value={c.category_id}>
                  {c.icon_emoji} {c.name_ar}
                </option>
              ))}
            </select>
          </div>
          <div className="card p-4">
            <label className="block text-xs font-medium text-slate-400 mb-2">الصعوبة</label>
            <div className="flex gap-1.5">
              {DIFFICULTY_OPTIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setForm(prev => ({ ...prev, difficulty_label: d.value }))}
                  className={clsx(
                    'flex-1 py-2 rounded-lg text-xs font-medium transition-all border',
                    form.difficulty_label === d.value
                      ? `${d.color} bg-surface-200 border-current`
                      : 'text-slate-500 border-transparent hover:bg-surface-100'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-slate-300">
              الخيارات *
              <span className="text-slate-600 font-normal mr-2 text-xs">({form.options.length}/4) — حد أدنى 2، حد أقصى 4</span>
            </label>
            {form.options.length < 4 && (
              <button onClick={addOption} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                <PlusCircle size={14} /> إضافة خيار
              </button>
            )}
          </div>

          <div className="space-y-3">
            {form.options.map((opt, i) => (
              <div key={i} className={clsx(
                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                opt.is_correct ? 'border-green-500/50 bg-green-500/5' : 'border-white/5 bg-surface-100'
              )}>
                <div className="w-7 h-7 rounded-lg bg-surface-200 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                  {LABELS[i]}
                </div>
                <input
                  type="text"
                  value={opt.option_text}
                  onChange={e => {
                    const opts = [...form.options];
                    opts[i] = { ...opts[i], option_text: e.target.value };
                    setForm(prev => ({ ...prev, options: opts }));
                  }}
                  placeholder={`الخيار ${LABELS[i]}`}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-slate-600"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrect(i)}
                    className={clsx(
                      'p-1.5 rounded-lg transition-all',
                      opt.is_correct
                        ? 'text-green-400 bg-green-400/15'
                        : 'text-slate-600 hover:text-green-400 hover:bg-surface-200'
                    )}
                    title="تحديد كإجابة صحيحة"
                  >
                    <CheckCircle size={16} className={opt.is_correct ? 'fill-current' : ''} />
                  </button>
                  {form.options.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-surface-200 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!form.options.some(o => o.is_correct) && form.options.some(o => o.option_text) && (
            <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
              ⚠️ اضغط على ✓ لتحديد الإجابة الصحيحة
            </p>
          )}
        </div>

        {/* Explanation */}
        <div className="card p-5 border-green-500/10">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={16} className="text-green-400" />
            <label className="text-sm font-medium text-slate-300">الشرح النموذجي *</label>
            <span className="text-xs text-slate-600">(يظهر للمتفاعل بعد الإجابة)</span>
          </div>
          <textarea
            value={form.explanation_text}
            onChange={e => setForm(prev => ({ ...prev, explanation_text: e.target.value }))}
            placeholder="اشرح سبب صحة الإجابة بشكل مفصل (20 حرف على الأقل)..."
            rows={3}
            className="input-field resize-none text-sm mb-3 border-green-500/20 focus:border-green-500"
          />
          <input
            type="text"
            value={form.explanation_source}
            onChange={e => setForm(prev => ({ ...prev, explanation_source: e.target.value }))}
            placeholder="المصدر أو المرجع (اختياري) — رابط أو اسم كتاب"
            className="input-field text-sm"
          />
          {form.explanation_text.length > 0 && form.explanation_text.length < 20 && (
            <p className="text-xs text-yellow-500 mt-2">
              الشرح يحتاج {20 - form.explanation_text.length} حرفاً إضافية على الأقل
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-base"
        >
          {submitMutation.isPending
            ? <><Loader2 size={18} className="animate-spin" /> جارٍ النشر...</>
            : <><Send size={18} /> نشر السؤال</>
          }
        </button>
      </div>
    </div>
  );
}

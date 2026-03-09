// QuestionPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';
import QuestionCard from '../components/question/QuestionCard';

export default function QuestionPage() {
  const { id } = useParams();

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => api.get(`/questions/${id}`).then(r => r.data),
  });

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-brand-400" size={32} />
    </div>
  );

  if (!question) return (
    <div className="text-center py-12 text-slate-500">
      <p>السؤال غير موجود</p>
      <Link to="/" className="text-brand-400 hover:underline mt-2 inline-block">العودة للرئيسية</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-4 transition-colors">
        <ArrowRight size={16} />
        العودة
      </Link>
      <QuestionCard question={question} />
    </div>
  );
}

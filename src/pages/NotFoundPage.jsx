import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/25">
          <Sparkles size={36} className="text-white" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-3">404</h1>
        <p className="text-slate-400 mb-6 text-lg">هذه الصفحة غير موجودة</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home size={18} /> العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}

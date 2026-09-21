import React, { useState } from 'react';
import { PhrasePattern } from '../types';
import { Sparkles, Layers, AlertCircle, BookmarkCheck, Check, Copy } from 'lucide-react';

interface PhrasePatternsProps {
  patterns: PhrasePattern[];
  onToggleFlashcardPattern: (patternId: string) => void;
}

export const PhrasePatterns: React.FC<PhrasePatternsProps> = ({
  patterns,
  onToggleFlashcardPattern,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const collocations = patterns.filter((p) => p.type === 'collocation');
  const usefulPatterns = patterns.filter((p) => p.type === 'pattern');
  const phrasalsAndIdioms = patterns.filter((p) => p.type === 'phrasal_verb_idiom');

  const handleCopy = (formula: string, id: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderPatternCard = (pattern: PhrasePattern) => {
    return (
      <div
        key={pattern.id}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 hover:border-teal-400 dark:hover:border-teal-700 transition-all"
      >
        {/* Header formula */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {pattern.type === 'collocation'
                ? 'Collocation Học thuật'
                : pattern.type === 'pattern'
                ? 'Cấu trúc câu (Useful Chunk)'
                : 'Cụm động từ / Thành ngữ'}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
              {pattern.formula}
            </h3>
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              {pattern.meaningVi}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleCopy(pattern.formula, pattern.id)}
              title="Sao chép công thức"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copiedId === pattern.id ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onToggleFlashcardPattern(pattern.id)}
              title={pattern.inFlashcards ? 'Đã thêm vào thẻ học' : 'Thêm vào thẻ học'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                pattern.inFlashcards
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{pattern.inFlashcards ? 'Đã trong Flashcards' : 'Thêm vào thẻ học'}</span>
            </button>
          </div>
        </div>

        {/* Usage description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Cách dùng:</strong> {pattern.usageVi}
        </p>

        {/* Examples */}
        <div className="space-y-2 text-xs">
          {pattern.originalExample && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Trong bài đọc / bài nghe:
              </span>
              <p className="italic font-serif text-slate-800 dark:text-slate-200">
                "{pattern.originalExample}"
              </p>
            </div>
          )}

          <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/60">
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block mb-0.5">
              Ví dụ mở rộng cho học sinh Việt Nam:
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              "{pattern.newExample}"
            </p>
          </div>
        </div>

        {/* Vietnamese students' common mistake */}
        {pattern.mistakeVi && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Lỗi học sinh Việt Nam hay mắc: </strong>
              <span>{pattern.mistakeVi}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Intro info */}
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent p-6 rounded-2xl border border-teal-200/60 dark:border-teal-800/60 space-y-2">
        <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Kho cấu trúc, Chunks & Collocations</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Học từ theo cụm (chunks) là bí quyết số một để đạt Band 7.0+ Lexical Resource trong IELTS. Thay vì dịch từng từ từ tiếng Việt, hãy nạp các cụm diễn đạt tự nhiên dưới đây.
        </p>
      </div>

      {/* Group 1: Collocations */}
      {collocations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-500" />
            <span>Academic Collocations ({collocations.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collocations.map((p) => renderPatternCard(p))}
          </div>
        </div>
      )}

      {/* Group 2: Useful Chunks & Patterns */}
      {usefulPatterns.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Useful Chunks & Sentence Patterns ({usefulPatterns.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usefulPatterns.map((p) => renderPatternCard(p))}
          </div>
        </div>
      )}

      {/* Group 3: Phrasal Verbs & Idioms */}
      {phrasalsAndIdioms.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Phrasal Verbs & Idiomatic Expressions ({phrasalsAndIdioms.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phrasalsAndIdioms.map((p) => renderPatternCard(p))}
          </div>
        </div>
      )}
    </div>
  );
};

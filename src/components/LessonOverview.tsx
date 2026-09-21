import React from 'react';
import { Lesson } from '../types';
import { BookOpen, Headphones, FileText, CheckCircle2, Bookmark, Compass, Sparkles } from 'lucide-react';
import coverBannerImg from '../assets/images/ielts_cover_banner_1790011234092.jpg';

interface LessonOverviewProps {
  lesson: Lesson;
  onStartFlashcards: () => void;
  onStartExercises: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const LessonOverview: React.FC<LessonOverviewProps> = ({
  lesson,
  onStartFlashcards,
  onStartExercises,
}) => {
  const mustLearnCount = lesson.vocabulary.filter((v) => v.priority === 'must').length;
  const shouldLearnCount = lesson.vocabulary.filter((v) => v.priority === 'should').length;
  const niceCount = lesson.vocabulary.filter((v) => v.priority === 'nice').length;

  return (
    <div className="space-y-6">
      {/* Cover Banner Image - Clean image without captions or descriptive tags */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-900">
        <img
          src={coverBannerImg}
          alt="PhuongChick IELTS 21"
          referrerPolicy="no-referrer"
          className="w-full h-48 sm:h-64 lg:h-72 object-cover object-center"
        />
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-teal-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30">
                {lesson.skill === 'Reading' ? <BookOpen className="w-3.5 h-3.5" /> : <Headphones className="w-3.5 h-3.5" />}
                {lesson.skill} • {lesson.section}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200">
                {lesson.source}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Target: {lesson.level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {lesson.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Bài học được AI trích xuất chuyên sâu, giải nghĩa theo ngữ cảnh đề thi thật và đi kèm hệ thống bài tập thực hành tương tác.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              id="overview-start-flashcards-btn"
              onClick={onStartFlashcards}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Học Flashcards ({lesson.vocabulary.length} từ)</span>
            </button>
            <button
              id="overview-start-exercises-btn"
              onClick={onStartExercises}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Làm bài tập ({lesson.exercises.length} câu)</span>
            </button>
          </div>
        </div>

        {/* Priority Quick Stats */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-xs text-slate-400">Tổng mục từ</p>
            <p className="text-xl font-bold text-white mt-1">{lesson.vocabulary.length}</p>
          </div>
          <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
            <p className="text-xs text-rose-300 font-medium">Must Learn (Bắt buộc)</p>
            <p className="text-xl font-bold text-rose-200 mt-1">{mustLearnCount}</p>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <p className="text-xs text-amber-300 font-medium">Should Learn (Nên nhớ)</p>
            <p className="text-xl font-bold text-amber-200 mt-1">{shouldLearnCount}</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
            <p className="text-xs text-blue-300 font-medium">Nice to Know (Mở rộng)</p>
            <p className="text-xl font-bold text-blue-200 mt-1">{niceCount}</p>
          </div>
        </div>
      </div>

      {/* Summary and Structure Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vietnamese Summary (3-5 ideas) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Bookmark className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              Tóm tắt nội dung bài học (Tiếng Việt)
            </h2>
          </div>

          <div className="space-y-3">
            {lesson.summaryVi.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-teal-200 dark:border-teal-800">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {point}
                </p>
              </div>
            ))}
          </div>

          {/* Topic tags */}
          {lesson.topicFields && lesson.topicFields.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Chủ đề liên quan:
              </span>
              {lesson.topicFields.map((field, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  #{field}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Structure / Communication Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Compass className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              {lesson.skill === 'Reading' ? 'Bố cục bài đọc' : 'Bối cảnh bài nghe'}
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
            {lesson.structureAnalysisVi ||
              'Chưa có phân tích bố cục cụ thể. Bạn có thể nhấn Chế độ giáo viên để bổ sung ghi chú này.'}
          </p>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mb-1">
                💡 Lời khuyên của Cô Phượng Chick:
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Đừng học từng từ riêng lẻ! Hãy nhớ từ vựng cùng với câu ví dụ trong bài và các kết hợp từ (collocations) đi liền để dùng được ngay vào Speaking & Writing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Original Passage / Transcript Drawer Accordion */}
      <details className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <summary className="p-5 flex items-center justify-between cursor-pointer font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 select-none">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span>Xem lại toàn bộ văn bản gốc bài đọc / bài nghe ({lesson.originalText.split(/\s+/).length} từ)</span>
          </div>
          <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {lesson.originalText}
          </div>
        </div>
      </details>
    </div>
  );
};

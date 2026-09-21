import React from 'react';
import {
  TrendingUp,
  Award,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import { Lesson, WordProgress, TestSessionResult } from '../types';

interface ProgressDashboardProps {
  lessons: Lesson[];
  progressMap: Record<string, WordProgress>;
  testHistory: TestSessionResult[];
  onStartReviewWeakWords: (weakWordIds: string[]) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  lessons,
  progressMap,
  testHistory,
  onStartReviewWeakWords,
}) => {
  // Aggregate all words across all lessons
  const allWords = lessons.flatMap((l) => l.vocabulary);
  const totalWordsCount = allWords.length;

  let masteredCount = 0;
  let somewhatCount = 0;
  let notLearnedCount = 0;
  let starredCount = 0;

  const weakWordIds: string[] = [];

  allWords.forEach((word) => {
    const prog = progressMap[word.id];
    if (prog) {
      if (prog.status === 'mastered') masteredCount++;
      else if (prog.status === 'somewhat') somewhatCount++;
      else {
        notLearnedCount++;
        weakWordIds.push(word.id);
      }

      if (prog.starred) starredCount++;
    } else {
      notLearnedCount++;
      weakWordIds.push(word.id);
    }
  });

  // Calculate average score from test history
  const averageScore =
    testHistory.length > 0
      ? Math.round(testHistory.reduce((acc, t) => acc + t.percentage, 0) / testHistory.length)
      : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <TrendingUp className="w-7 h-7 text-teal-600" />
          <span>Tiến độ học tập & Thống kê từ vựng</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Dữ liệu được lưu trữ tự động trên trình duyệt của bạn qua localStorage.
        </p>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total words */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 font-medium">Tổng mục từ trong kho</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {totalWordsCount}
          </p>
        </div>

        {/* Mastered */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Đã thành thạo</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {masteredCount}
          </p>
        </div>

        {/* Somewhat */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <HelpCircle className="w-4 h-4" />
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Hơi nhớ (Cần ôn)</p>
          <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {somewhatCount}
          </p>
        </div>

        {/* Test Avg */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Điểm làm bài TB</p>
          <p className="text-2xl font-black text-blue-600 mt-1 font-mono">
            {averageScore}%
          </p>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Phân bố mức độ ghi nhớ</span>
          <span>
            {totalWordsCount > 0 ? Math.round((masteredCount / totalWordsCount) * 100) : 0}% hoàn thành
          </span>
        </div>

        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${totalWordsCount ? (masteredCount / totalWordsCount) * 100 : 0}%` }}
            className="bg-emerald-500 h-full transition-all"
            title="Đã nhớ"
          />
          <div
            style={{ width: `${totalWordsCount ? (somewhatCount / totalWordsCount) * 100 : 0}%` }}
            className="bg-amber-500 h-full transition-all"
            title="Hơi nhớ"
          />
          <div
            style={{ width: `${totalWordsCount ? (notLearnedCount / totalWordsCount) * 100 : 0}%` }}
            className="bg-rose-500 h-full transition-all"
            title="Chưa nhớ"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Đã nhớ: {masteredCount} từ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Hơi nhớ: {somewhatCount} từ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Chưa nhớ: {notLearnedCount} từ
          </span>
        </div>
      </div>

      {/* Weak Words Spotlight */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Các từ trọng tâm cần ôn lại ngay ({weakWordIds.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Những từ bạn đã đánh dấu "Chưa nhớ" hoặc làm sai trong các bài tập gần đây.
            </p>
          </div>

          {weakWordIds.length > 0 && (
            <button
              onClick={() => onStartReviewWeakWords(weakWordIds)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ôn ngay qua Flashcards</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
          {allWords
            .filter((w) => weakWordIds.includes(w.id))
            .slice(0, 9)
            .map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-slate-900 dark:text-white font-mono">
                    {w.term}
                  </strong>
                  <span className="text-[10px] uppercase font-bold text-rose-600">
                    {w.priority}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 truncate">
                  {w.meaningVi}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Test History List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>Lịch sử các bài kiểm tra gần nhất</span>
        </h3>

        {testHistory.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {testHistory.map((sess, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {sess.lessonTitle}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {new Date(sess.completedAt).toLocaleString('vi-VN')} • {sess.correctQuestions} / {sess.totalQuestions} câu đúng
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-black font-mono ${
                      sess.percentage >= 80 ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {sess.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Bạn chưa hoàn thành bài kiểm tra nào. Hãy chuyển qua tab Luyện tập để bắt đầu!
          </p>
        )}
      </div>
    </div>
  );
};

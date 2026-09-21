import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  Star,
  Shuffle,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Flame,
  Award
} from 'lucide-react';
import { VocabularyItem, WordProgress, MemoryStatus } from '../types';
import { playPronunciation } from '../utils/speech';

interface FlashcardDeckProps {
  vocabulary: VocabularyItem[];
  progressMap: Record<string, WordProgress>;
  onUpdateWordProgress: (progress: WordProgress) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  vocabulary,
  progressMap,
  onUpdateWordProgress,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mustLearnOnly, setMustLearnOnly] = useState(false);
  const [unlearnedOnly, setUnlearnedOnly] = useState(false);
  const [starredOnly, setStarredOnly] = useState(false);
  const [deck, setDeck] = useState<VocabularyItem[]>(vocabulary);

  // Filter deck based on settings
  const rebuildDeck = useCallback(() => {
    let filtered = [...vocabulary];

    if (mustLearnOnly) {
      filtered = filtered.filter((v) => v.priority === 'must');
    }

    if (unlearnedOnly) {
      filtered = filtered.filter((v) => {
        const prog = progressMap[v.id];
        return !prog || prog.status === 'not_learned';
      });
    }

    if (starredOnly) {
      filtered = filtered.filter((v) => {
        const prog = progressMap[v.id];
        return prog && prog.starred;
      });
    }

    // Sort: prioritize unlearned words first
    filtered.sort((a, b) => {
      const progA = progressMap[a.id]?.status || 'not_learned';
      const progB = progressMap[b.id]?.status || 'not_learned';
      const score = { not_learned: 0, somewhat: 1, mastered: 2 };
      return score[progA] - score[progB];
    });

    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [vocabulary, mustLearnOnly, unlearnedOnly, starredOnly, progressMap]);

  useEffect(() => {
    rebuildDeck();
  }, [mustLearnOnly, unlearnedOnly, starredOnly, vocabulary]);

  const currentWord = deck[currentIndex];
  const currentProgress = currentWord
    ? progressMap[currentWord.id] || {
        wordId: currentWord.id,
        status: 'not_learned',
        starred: false,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewedAt: null,
      }
    : null;

  // Actions
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleSetStatus = useCallback(
    (status: MemoryStatus) => {
      if (!currentWord || !currentProgress) return;
      onUpdateWordProgress({
        ...currentProgress,
        status,
        lastReviewedAt: new Date().toISOString(),
      });
      // Move to next card smoothly
      if (currentIndex < deck.length - 1) {
        handleNext();
      }
    },
    [currentWord, currentProgress, currentIndex, deck.length, handleNext, onUpdateWordProgress]
  );

  const handleToggleStar = useCallback(() => {
    if (!currentWord || !currentProgress) return;
    onUpdateWordProgress({
      ...currentProgress,
      starred: !currentProgress.starred,
    });
  }, [currentWord, currentProgress, onUpdateWordProgress]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        handleSetStatus('not_learned');
      } else if (e.key === '2') {
        handleSetStatus('somewhat');
      } else if (e.key === '3') {
        handleSetStatus('mastered');
      } else if (e.key.toLowerCase() === 's') {
        handleToggleStar();
      } else if (e.key.toLowerCase() === 'a' && currentWord) {
        playPronunciation(currentWord.term, 'uk');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleSetStatus, handleToggleStar, isFlipped, currentWord]);

  // Create a contextual sentence with a blank for the front of the card
  const getGuessSentence = (word: VocabularyItem) => {
    if (!word.originalContext) return null;
    const regex = new RegExp(`\\b${word.term}\\b`, 'gi');
    if (regex.test(word.originalContext)) {
      return word.originalContext.replace(regex, '__________');
    }
    // Try to blank root form if derived
    return word.originalContext;
  };

  if (!currentWord || deck.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <Award className="w-12 h-12 text-teal-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Chúc mừng! Bạn đã hoàn thành các từ trong bộ lọc này!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Không còn từ nào chưa nhớ hoặc cần ôn tập theo tiêu chí hiện tại.
        </p>
        <button
          onClick={() => {
            setMustLearnOnly(false);
            setUnlearnedOnly(false);
            setStarredOnly(false);
          }}
          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-md hover:bg-teal-500 cursor-pointer"
        >
          Học lại toàn bộ thẻ
        </button>
      </div>
    );
  }

  const guessSentence = getGuessSentence(currentWord);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Must learn toggle */}
          <button
            onClick={() => setMustLearnOnly(!mustLearnOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mustLearnOnly
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Chỉ mục Must learn
          </button>

          {/* Unlearned toggle */}
          <button
            onClick={() => setUnlearnedOnly(!unlearnedOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              unlearnedOnly
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Từ chưa nhớ
          </button>

          {/* Starred toggle */}
          <button
            onClick={() => setStarredOnly(!starredOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              starredOnly
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Đã gắn sao</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title="Trộn thẻ ngẫu nhiên"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
            {currentIndex + 1} / {deck.length}
          </span>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div className="perspective-1000 min-h-[380px] w-full cursor-pointer select-none" onClick={handleFlip}>
        <div
          className={`relative w-full h-full min-h-[380px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-white via-slate-50 to-teal-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-7 sm:p-8 border-2 border-teal-500/30 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                  {currentWord.cefr} • {currentWord.priority.toUpperCase()}
                </span>
                <span className="text-xs italic text-slate-500">
                  ({currentWord.partOfSpeech})
                </span>
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleToggleStar}
                  title="Gắn sao từ khó"
                  className={`p-2 rounded-xl transition-colors ${
                    currentProgress?.starred
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Star className={`w-5 h-5 ${currentProgress?.starred ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Center: Main Word, IPA, Pronunciation, Guess Sentence */}
            <div className="text-center space-y-4 py-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {currentWord.term}
              </h2>

              <div className="flex items-center justify-center gap-4 text-sm font-mono text-teal-700 dark:text-teal-300">
                <div className="flex items-center gap-1.5">
                  <span>UK: {currentWord.ipaUk}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(currentWord.term, 'uk');
                    }}
                    className="p-1 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-600 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {currentWord.ipaUs && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span>US: {currentWord.ipaUs}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playPronunciation(currentWord.term, 'us');
                      }}
                      className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Contextual Guess sentence with blank */}
              {guessSentence && (
                <div className="mt-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Đoán nghĩa qua ngữ cảnh bài thi:
                  </span>
                  <p className="text-sm font-serif italic text-slate-700 dark:text-slate-300 leading-relaxed">
                    "{guessSentence}"
                  </p>
                </div>
              )}
            </div>

            {/* Bottom prompt to flip */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full">
                <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Nhấn thẻ hoặc phím Space để lật xem nghĩa & ví dụ</span>
              </span>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-white via-teal-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-3xl p-7 sm:p-8 border-2 border-teal-500/30 flex flex-col justify-between overflow-y-auto">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {currentWord.term}
                </span>
                <span className="text-xs text-slate-500 ml-2">({currentWord.partOfSpeech})</span>
              </div>
              <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
                {currentWord.ipaUk}
              </span>
            </div>

            {/* Content body */}
            <div className="space-y-3.5 py-2">
              {/* Vietnamese meaning */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Nghĩa trong ngữ cảnh bài:
                </span>
                <p className="text-base font-extrabold text-teal-700 dark:text-teal-300">
                  {currentWord.meaningVi}
                </p>
              </div>

              {/* English definition */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Định nghĩa tiếng Anh:
                </span>
                <p className="text-xs italic text-slate-600 dark:text-slate-300">
                  "{currentWord.definitionEn}"
                </p>
              </div>

              {/* Collocations */}
              {currentWord.collocations && currentWord.collocations.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Collocations quan trọng:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentWord.collocations.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Example and translation */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Ví dụ mới:
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  "{currentWord.exampleEn}"
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  → {currentWord.exampleVi}
                </p>
              </div>

              {/* Common mistakes */}
              {currentWord.commonMistakeVi && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Lỗi học sinh hay mắc: </strong>
                    <span>{currentWord.commonMistakeVi}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt */}
            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Đánh giá mức độ ghi nhớ của bạn ở thanh điều khiển phía dưới 👇
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Deck Controls (Memory Status & Prev/Next) */}
      <div className="space-y-4">
        {/* Memory status grading buttons (1, 2, 3) */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleSetStatus('not_learned')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentProgress?.status === 'not_learned'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 ring-2 ring-rose-400'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <span>[1] Chưa nhớ</span>
          </button>

          <button
            onClick={() => handleSetStatus('somewhat')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentProgress?.status === 'somewhat'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25 ring-2 ring-amber-400'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>[2] Hơi nhớ</span>
          </button>

          <button
            onClick={() => handleSetStatus('mastered')}
            className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentProgress?.status === 'mastered'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-400'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>[3] Đã nhớ</span>
          </button>
        </div>

        {/* Navigation buttons (Prev / Flip / Next) */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Thẻ trước</span>
          </button>

          <button
            onClick={handleFlip}
            className="px-5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Lật thẻ (Space)
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === deck.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>Thẻ sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Keyboard Shortcuts Guide Pill */}
        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            Phím tắt: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">Space</kbd> Lật • <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">→</kbd> Chuyển thẻ • <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">1/2/3</kbd> Đánh giá nhớ • <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">A</kbd> Phát âm • <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">S</kbd> Gắn sao
          </p>
        </div>
      </div>
    </div>
  );
};

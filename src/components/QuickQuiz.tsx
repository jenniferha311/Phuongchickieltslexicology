import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  Star,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Filter,
  Check,
  Flame,
  Clock,
  BookMarked
} from 'lucide-react';
import { VocabularyItem, WordProgress, Lesson, PriorityLevel } from '../types';
import { playPronunciation } from '../utils/speech';

export interface QuickQuizProps {
  lessons: Lesson[];
  progressMap: Record<string, WordProgress>;
  onUpdateWordProgress: (progress: WordProgress) => void;
  onNavigateTab: (tab: string) => void;
}

type QuizWord = VocabularyItem & { lessonTitle?: string; lessonId?: string };

interface QuizQuestion {
  id: string;
  word: QuizWord;
  type: 'meaning_to_term' | 'term_to_meaning' | 'context_cloze' | 'collocation';
  prompt: string;
  subPrompt?: string;
  contextSentence?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const QuickQuiz: React.FC<QuickQuizProps> = ({
  lessons,
  progressMap,
  onUpdateWordProgress,
  onNavigateTab,
}) => {
  // Aggregate all words across all lessons
  const allWordsWithLesson: QuizWord[] = useMemo(() => {
    return lessons.flatMap((lesson) =>
      lesson.vocabulary.map((vocab) => ({
        ...vocab,
        lessonTitle: lesson.title,
        lessonId: lesson.id,
      }))
    );
  }, [lessons]);

  // Filter only starred words
  const starredWords: QuizWord[] = useMemo(() => {
    return allWordsWithLesson.filter((item) => progressMap[item.id]?.starred);
  }, [allWordsWithLesson, progressMap]);

  // Lesson filter state
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(5);

  // Active quiz session states
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [userAnswersRecord, setUserAnswersRecord] = useState<
    { question: QuizQuestion; answer: string; isCorrect: boolean }[]
  >([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Filter starred words by selected lesson
  const filteredStarredWords: QuizWord[] = useMemo(() => {
    if (selectedLessonFilter === 'all') return starredWords;
    return starredWords.filter((w) => w.lessonId === selectedLessonFilter);
  }, [starredWords, selectedLessonFilter]);

  // Helper to generate dynamic questions from words
  const generateQuestions = (targetWords: QuizWord[]): QuizQuestion[] => {
    if (targetWords.length === 0) return [];

    const shuffledTargets = [...targetWords].sort(() => Math.random() - 0.5);
    const selectedTargets = shuffledTargets.slice(0, Math.min(quizQuestionCount, shuffledTargets.length));

    return selectedTargets.map((item, idx) => {
      // Pick question type
      const possibleTypes: ('meaning_to_term' | 'term_to_meaning' | 'context_cloze' | 'collocation')[] = [
        'term_to_meaning',
        'meaning_to_term',
      ];
      if (item.originalContext || item.exampleEn) {
        possibleTypes.push('context_cloze');
      }
      if (item.collocations && item.collocations.length > 0) {
        possibleTypes.push('collocation');
      }

      const questionType = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      const distractors = allWordsWithLesson.filter((w) => w.id !== item.id);

      if (questionType === 'term_to_meaning') {
        const wrongMeanings = [...distractors]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((w) => w.meaningVi);
        const options = [item.meaningVi, ...wrongMeanings].sort(() => Math.random() - 0.5);

        return {
          id: `qq-${idx}-${item.id}`,
          word: item,
          type: 'term_to_meaning',
          prompt: item.term,
          subPrompt: `(${item.partOfSpeech}) • CEFR: ${item.cefr}`,
          options,
          correctAnswer: item.meaningVi,
          explanation: item.contextExplanationVi || item.definitionEn,
        };
      }

      if (questionType === 'meaning_to_term') {
        const wrongTerms = [...distractors]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((w) => w.term);
        const options = [item.term, ...wrongTerms].sort(() => Math.random() - 0.5);

        return {
          id: `qq-${idx}-${item.id}`,
          word: item,
          type: 'meaning_to_term',
          prompt: item.meaningVi,
          subPrompt: `Từ loại: ${item.partOfSpeech} • Trình độ: ${item.cefr}`,
          options,
          correctAnswer: item.term,
          explanation: `"${item.term}": ${item.definitionEn}`,
        };
      }

      if (questionType === 'context_cloze') {
        const baseSentence = item.originalContext || item.exampleEn;
        // Replace target word in sentence with blank
        const regex = new RegExp(`\\b${item.term}\\b`, 'gi');
        let blankedSentence = baseSentence.replace(regex, '[ ________ ]');
        if (blankedSentence === baseSentence) {
          // If regex exact match failed, replace case-insensitively
          blankedSentence = baseSentence.replace(new RegExp(item.term.slice(0, 4), 'gi'), '[ ________ ]');
        }

        const wrongTerms = [...distractors]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((w) => w.term);
        const options = [item.term, ...wrongTerms].sort(() => Math.random() - 0.5);

        return {
          id: `qq-${idx}-${item.id}`,
          word: item,
          type: 'context_cloze',
          prompt: 'Điền từ thích hợp vào câu trích đoạn bài thi Cambridge IELTS:',
          contextSentence: blankedSentence,
          subPrompt: `Gợi ý nghĩa: "${item.meaningVi}"`,
          options,
          correctAnswer: item.term,
          explanation: `Câu hoàn chỉnh: "${baseSentence}" (${item.contextExplanationVi || item.meaningVi})`,
        };
      }

      // Collocation question
      const sampleCollocation = item.collocations[Math.floor(Math.random() * item.collocations.length)];
      const regex = new RegExp(`\\b${item.term}\\b`, 'gi');
      const blankedCollocation = sampleCollocation.replace(regex, '[ ________ ]');

      const wrongTerms = [...distractors]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.term);
      const options = [item.term, ...wrongTerms].sort(() => Math.random() - 0.5);

      return {
        id: `qq-${idx}-${item.id}`,
        word: item,
        type: 'collocation',
        prompt: 'Từ nào tạo thành Collocation tự nhiên trong bài thi?',
        contextSentence: blankedCollocation,
        subPrompt: `Collocation học thuật: ${blankedCollocation}`,
        options,
        correctAnswer: item.term,
        explanation: `Collocation chuẩn: "${sampleCollocation}". Nghĩa: ${item.meaningVi}`,
      };
    });
  };

  // Start the Quiz
  const handleStartQuiz = (wordsToQuiz: QuizWord[] = filteredStarredWords) => {
    const generated = generateQuestions(wordsToQuiz);
    if (generated.length === 0) return;

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setStreak(0);
    setMaxStreak(0);
    setUserAnswersRecord([]);
    setIsFinished(false);
    setIsQuizActive(true);
  };

  // Handle answering an option
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (newStreak > maxStreak) {
      setMaxStreak(newStreak);
    }

    // Record response
    setUserAnswersRecord((prev) => [
      ...prev,
      { question: currentQ, answer: option, isCorrect },
    ]);

    // Update word progress in storage
    const currentProg = progressMap[currentQ.word.id] || {
      wordId: currentQ.word.id,
      status: 'not_learned',
      starred: true,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
    };

    const updatedProg: WordProgress = {
      ...currentProg,
      correctCount: isCorrect ? currentProg.correctCount + 1 : currentProg.correctCount,
      incorrectCount: !isCorrect ? currentProg.incorrectCount + 1 : currentProg.incorrectCount,
      status: isCorrect
        ? currentProg.status === 'not_learned'
          ? 'somewhat'
          : 'mastered'
        : 'not_learned',
      lastReviewedAt: new Date().toISOString(),
    };
    onUpdateWordProgress(updatedProg);
  };

  // Move to next question or finish
  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  // Toggle star status of current word
  const handleToggleStar = (wordId: string) => {
    const current = progressMap[wordId] || {
      wordId,
      status: 'not_learned',
      starred: false,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewedAt: null,
    };

    onUpdateWordProgress({
      ...current,
      starred: !current.starred,
      lastReviewedAt: new Date().toISOString(),
    });
  };

  // Quick star high-priority words if zero starred
  const handleStarCoreWords = () => {
    const coreWords = allWordsWithLesson.filter((w) => w.priority === 'must').slice(0, 5);
    coreWords.forEach((word) => {
      const current = progressMap[word.id] || {
        wordId: word.id,
        status: 'not_learned',
        starred: false,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewedAt: null,
      };
      onUpdateWordProgress({
        ...current,
        starred: true,
        lastReviewedAt: new Date().toISOString(),
      });
    });
  };

  // Retry missed words
  const handleRetryMissed = () => {
    const missedWords = userAnswersRecord
      .filter((rec) => !rec.isCorrect)
      .map((rec) => rec.question.word);

    if (missedWords.length > 0) {
      handleStartQuiz(missedWords);
    } else {
      handleStartQuiz(filteredStarredWords);
    }
  };

  // Keyboard shortcut listener during active quiz
  useEffect(() => {
    if (!isQuizActive || isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        if (e.key === '1' || e.key === '2' || e.key === '3' || e.key === '4') {
          const index = parseInt(e.key, 10) - 1;
          const currentQ = questions[currentIndex];
          if (currentQ && currentQ.options[index]) {
            handleSelectOption(currentQ.options[index]);
          }
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuizActive, isFinished, isAnswered, currentIndex, questions]);

  const currentQ = questions[currentIndex];
  const correctCount = userAnswersRecord.filter((r) => r.isCorrect).length;
  const accuracy = userAnswersRecord.length > 0
    ? Math.round((correctCount / userAnswersRecord.length) * 100)
    : 0;

  // Render Quiz Intro / Setup Screen if not active
  if (!isQuizActive) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>Thử thách phản xạ từ vựng</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quick Quiz: Từ vựng đánh dấu ⭐
            </h1>

            <p className="text-amber-100 text-sm sm:text-base max-w-2xl leading-relaxed">
              Kiểm tra nhanh toàn bộ các từ vựng bạn đã đánh dấu yêu thích mà không cần phải truy cập sâu vào từng bài học. Tự động tạo câu hỏi trắc nghiệm, điền từ theo ngữ cảnh bài thi Cambridge IELTS 21.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm font-semibold text-amber-100">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>{starredWords.length} từ đã gắn sao</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <Flame className="w-4 h-4 text-orange-300 fill-orange-300" />
                <span>Thử thách Streak không giới hạn</span>
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <Award className="w-4 h-4 text-yellow-300" />
                <span>Phản xạ ngữ cảnh 100%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Zero Starred Words State */}
        {starredWords.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center mx-auto text-amber-500 shadow-xs">
              <Star className="w-8 h-8 fill-amber-400" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Bạn chưa đánh dấu ngôi sao ⭐ cho từ vựng nào
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hãy gắn sao cho các từ vựng bạn cảm thấy khó nhớ hoặc quan trọng trong bảng từ vựng để kích hoạt chế độ Quick Quiz kiểm tra nhanh.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleStarCoreWords}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gắn sao nhanh 5 từ Must Learn</span>
              </button>
              <button
                onClick={() => onNavigateTab('vocab')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Mở bảng từ vựng để chọn từ</span>
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Setup Configuration */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Config Column */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-500" />
                  <span>Tuỳ chỉnh bài Quick Quiz</span>
                </h3>

                {/* Filter by lesson */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Phạm vi bài học:
                  </label>
                  <select
                    value={selectedLessonFilter}
                    onChange={(e) => setSelectedLessonFilter(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">Tất cả bài học ({starredWords.length} từ gắn sao)</option>
                    {lessons.map((lesson) => {
                      const countInLesson = starredWords.filter((w) => w.lessonId === lesson.id).length;
                      return (
                        <option key={lesson.id} value={lesson.id} disabled={countInLesson === 0}>
                          {lesson.title} ({countInLesson} từ)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Question Count Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Số lượng câu hỏi:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[5, 10, filteredStarredWords.length].map((count) => {
                      const finalCount = Math.min(count, filteredStarredWords.length);
                      const isSelected = quizQuestionCount === count || (count === filteredStarredWords.length && quizQuestionCount >= filteredStarredWords.length);
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuizQuestionCount(count)}
                          className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer text-center ${
                            isSelected
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                              : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                          }`}
                        >
                          <div>{count === filteredStarredWords.length ? 'Tất cả' : `${count} câu`}</div>
                          <span className="text-[11px] opacity-80 block font-normal mt-0.5">
                            {count === filteredStarredWords.length ? `${filteredStarredWords.length} từ` : 'Cấp tốc'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={() => handleStartQuiz()}
                  disabled={filteredStarredWords.length === 0}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>Bắt đầu Quick Quiz ({Math.min(quizQuestionCount, filteredStarredWords.length)} câu)</span>
                </button>
              </div>
            </div>

            {/* Side Overview List of Starred Words */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Danh sách từ sẽ kiểm tra</span>
                  </h4>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                    {filteredStarredWords.length} từ
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-sm scrollbar-thin">
                  {filteredStarredWords.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 group hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {item.term}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {item.partOfSpeech}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.meaningVi}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleStar(item.id)}
                        title="Bỏ gắn sao từ này"
                        className="text-amber-500 hover:text-slate-400 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Star className="w-4 h-4 fill-amber-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Quiz Finished Screen
  if (isFinished) {
    const isPassing = accuracy >= 70;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center space-y-6 shadow-sm">
          {/* Trophy / Score Avatar */}
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-md ${
              isPassing
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-orange-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isPassing ? <Award className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Kết quả Quick Quiz
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {correctCount} / {questions.length} câu đúng ({accuracy}%)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              {accuracy === 100
                ? 'Tuyệt đỉnh! Cậu đã làm chủ hoàn toàn các từ vựng gắn sao này rồi!'
                : accuracy >= 70
                ? 'Rất tốt! Cậu chỉ cần củng cố thêm một chút ở các từ chưa chuẩn xác.'
                : 'Đừng nản nhé! Học từ vựng học thuật cần sự lặp lại liên tục. Hãy ôn lại bằng Flashcards!'}
            </p>
          </div>

          {/* Key Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <div>
              <div className="text-xs text-slate-400 font-medium">Chính xác</div>
              <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{accuracy}%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Max Streak</div>
              <div className="text-lg font-bold text-orange-500 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>{maxStreak}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Từ gắn sao</div>
              <div className="text-lg font-bold text-amber-500">{starredWords.length} từ</div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="text-left space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Chi tiết câu trả lời:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
              {userAnswersRecord.map((record, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-sm flex items-start justify-between gap-3 ${
                    record.isCorrect
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {record.question.word.term}
                      </span>
                      <span className="text-xs text-slate-400">({record.question.word.partOfSpeech})</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Nghĩa: <span className="font-medium">{record.question.word.meaningVi}</span>
                    </div>
                    {!record.isCorrect && (
                      <div className="text-xs text-rose-600 dark:text-rose-400">
                        Cậu chọn: <span className="line-through">{record.answer}</span> • Đúng: <span className="font-bold">{record.question.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleToggleStar(record.question.word.id)}
                    title={progressMap[record.question.word.id]?.starred ? 'Đang gắn sao (Click để bỏ sao)' : 'Click để gắn sao'}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        progressMap[record.question.word.id]?.starred ? 'fill-amber-500' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleStartQuiz()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Làm lại Quiz</span>
            </button>

            {userAnswersRecord.some((r) => !r.isCorrect) && (
              <button
                onClick={handleRetryMissed}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold text-sm hover:bg-rose-100 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Chỉ luyện các từ làm sai</span>
              </button>
            )}

            <button
              onClick={() => setIsQuizActive(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 transition-all cursor-pointer"
            >
              <span>Về menu Quick Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Question Interface
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header Bar with Progress and Streak */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-32 sm:w-48 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-extrabold animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{streak} Streak!</span>
            </div>
          )}

          <button
            onClick={() => setIsQuizActive(false)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-medium"
          >
            Thoát
          </button>
        </div>
      </div>

      {/* Main Interactive Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm relative">
        {/* Top Tag & Audio button */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold uppercase tracking-wider">
              {currentQ.type === 'context_cloze'
                ? 'Điền từ theo ngữ cảnh'
                : currentQ.type === 'collocation'
                ? 'Collocation Challenge'
                : currentQ.type === 'term_to_meaning'
                ? 'Từ vựng sang Nghĩa'
                : 'Đoán từ tiếng Anh'}
            </span>
            {currentQ.word.lessonTitle && (
              <span className="text-[11px] text-slate-400 truncate max-w-[200px] hidden sm:inline">
                {currentQ.word.lessonTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playPronunciation(currentQ.word.term, 'uk')}
              title="Phát âm UK"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 hover:text-teal-600 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleToggleStar(currentQ.word.id)}
              title="Gắn sao / Bỏ sao"
              className="p-1.5 rounded-lg text-amber-500 hover:scale-110 transition-transform cursor-pointer"
            >
              <Star
                className={`w-4 h-4 ${
                  progressMap[currentQ.word.id]?.starred ? 'fill-amber-500' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-3">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {currentQ.prompt}
          </h3>

          {currentQ.contextSentence && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 text-slate-800 dark:text-slate-200 text-base italic font-serif leading-relaxed">
              "{currentQ.contextSentence}"
            </div>
          )}

          {currentQ.subPrompt && (
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {currentQ.subPrompt}
            </p>
          )}
        </div>

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === currentQ.correctAnswer;

            let optionStyle =
              'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-slate-800';

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle =
                  'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm';
              } else if (isSelected && !isCorrectOption) {
                optionStyle =
                  'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200 shadow-sm';
              } else {
                optionStyle =
                  'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(option)}
                className={`p-4 rounded-2xl border text-left font-semibold text-sm sm:text-base transition-all flex items-center justify-between gap-3 cursor-pointer ${optionStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-bold flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Drawer */}
        {isAnswered && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
            <div
              className={`p-4 rounded-2xl text-sm border space-y-2 ${
                selectedAnswer === currentQ.correctAnswer
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  {selectedAnswer === currentQ.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Chính xác tuyệt đối!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Chưa chính xác! Đáp án đúng: "{currentQ.correctAnswer}"</span>
                    </>
                  )}
                </span>

                {/* Quick Unstar Action if answered right */}
                {selectedAnswer === currentQ.correctAnswer && progressMap[currentQ.word.id]?.starred && (
                  <button
                    onClick={() => handleToggleStar(currentQ.word.id)}
                    className="text-xs underline text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Đã thuộc? Bỏ gắn sao từ này
                  </button>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              {currentQ.word.commonMistakeVi && (
                <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 p-2 rounded-lg">
                  💡 <strong>Lưu ý từ Cô Phượng Chick:</strong> {currentQ.word.commonMistakeVi}
                </p>
              )}
            </div>

            {/* Next Question Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>{currentIndex + 1 === questions.length ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

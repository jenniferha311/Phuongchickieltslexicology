import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  BookOpen,
  Send,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Exercise, ExerciseResult, TestSessionResult, VocabularyItem } from '../types';

interface ExercisePlayerProps {
  lessonId: string;
  lessonTitle: string;
  exercises: Exercise[];
  vocabulary: VocabularyItem[];
  onSaveTestResult: (result: TestSessionResult) => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({
  lessonId,
  lessonTitle,
  exercises,
  vocabulary,
  onSaveTestResult,
}) => {
  const [activeExercises, setActiveExercises] = useState<Exercise[]>(exercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [instantGrading, setInstantGrading] = useState(true);

  // User responses
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, ExerciseResult>>({});
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);

  // Match meaning state (for active question)
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});

  // Collocation builder state
  const [matchedCollocations, setMatchedCollocations] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Finished state
  const [isFinished, setIsFinished] = useState(false);

  const currentExercise = activeExercises[currentIndex];

  if (!currentExercise || activeExercises.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <Award className="w-12 h-12 text-teal-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Chưa có bài tập nào được chọn!
        </h3>
        <p className="text-sm text-slate-500">
          Hãy kiểm tra lại danh sách bài tập hoặc dùng Chế độ giáo viên để tạo thêm câu hỏi.
        </p>
      </div>
    );
  }

  const currentResult = results[currentExercise.id];

  // Grade current exercise
  const handleCheckAnswer = async () => {
    const rawAnswer = userAnswers[currentExercise.id];
    let isCorrect = false;
    let feedbackVi = currentExercise.explanationVi;
    let aiEvaluation: ExerciseResult['aiEvaluation'] | undefined;

    // AI evaluated exercises (open ended)
    if (currentExercise.type === 'vi_to_en' || currentExercise.type === 'personal_application') {
      if (!rawAnswer || String(rawAnswer).trim().length === 0) return;
      setIsEvaluatingAi(true);

      try {
        const res = await fetch('/api/evaluate-writing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: currentExercise.type,
            question: currentExercise.question,
            targetWord: currentExercise.targetWord || '',
            studentAnswer: rawAnswer,
            vietnamesePrompt: currentExercise.vietnamesePrompt || '',
          }),
        });

        if (res.ok) {
          const aiData = await res.json();
          isCorrect = aiData.isCorrect;
          aiEvaluation = {
            usedTargetWord: aiData.usedTargetWord,
            grammarAndCollocationOk: aiData.grammarAndCollocationOk,
            naturalness: aiData.naturalness,
            betterVersion: aiData.betterVersion,
            teacherComment: aiData.teacherComment,
          };
          feedbackVi = aiData.teacherComment;
        } else {
          isCorrect = true; // fallback
          feedbackVi = 'Đã ghi nhận câu trả lời của bạn!';
        }
      } catch (e) {
        isCorrect = true;
        feedbackVi = 'Đã nộp bài!';
      } finally {
        setIsEvaluatingAi(false);
      }
    } else if (currentExercise.type === 'match_meaning') {
      const correctPairs = currentExercise.pairs || [];
      const userMatches = matchedPairs;
      const totalPairs = correctPairs.length;
      let matchedCount = 0;
      correctPairs.forEach((p) => {
        if (userMatches[p.en] === p.vi) {
          matchedCount++;
        }
      });
      isCorrect = matchedCount === totalPairs && totalPairs > 0;
    } else if (currentExercise.type === 'collocation_builder') {
      const correctColls = currentExercise.collocationParts || [];
      let collCorrect = 0;
      correctColls.forEach((c) => {
        if (matchedCollocations[c.left] === c.right) {
          collCorrect++;
        }
      });
      isCorrect = collCorrect === correctColls.length && correctColls.length > 0;
    } else if (currentExercise.type === 'multiple_choice') {
      isCorrect =
        String(rawAnswer).trim().toLowerCase() ===
        String(currentExercise.correctAnswer).trim().toLowerCase();
    } else if (currentExercise.type === 'fill_blank' || currentExercise.type === 'word_formation') {
      const cleanedUser = String(rawAnswer || '').trim().toLowerCase();
      const cleanedTarget = String(currentExercise.correctAnswer || '').trim().toLowerCase();
      isCorrect = cleanedUser === cleanedTarget;
    } else if (currentExercise.type === 'error_correction') {
      // accepts standard answer format or user target word
      const cleanedUser = String(rawAnswer || '').trim().toLowerCase();
      const cleanedTarget = String(currentExercise.correctAnswer || '').trim().toLowerCase();
      isCorrect = cleanedUser.includes(cleanedTarget) || cleanedTarget.includes(cleanedUser);
    }

    const newResult: ExerciseResult = {
      exerciseId: currentExercise.id,
      type: currentExercise.type,
      targetWord: currentExercise.targetWord || '',
      userAnswer: String(rawAnswer || ''),
      isCorrect,
      feedbackVi,
      aiEvaluation,
    };

    setResults((prev) => ({
      ...prev,
      [currentExercise.id]: newResult,
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeExercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedEn(null);
      setSelectedLeft(null);
    } else {
      finishTest();
    }
  };

  const finishTest = () => {
    setIsFinished(true);
    // Calculate final metrics
    const resultsList = Object.values(results);
    const correctCount = resultsList.filter((r) => r.isCorrect).length;
    const percentage = Math.round((correctCount / activeExercises.length) * 100);

    const masteredWords: string[] = [];
    const weakWords: string[] = [];

    activeExercises.forEach((ex) => {
      const res = results[ex.id];
      if (res && ex.targetWord) {
        if (res.isCorrect) {
          if (!masteredWords.includes(ex.targetWord)) masteredWords.push(ex.targetWord);
        } else {
          if (!weakWords.includes(ex.targetWord)) weakWords.push(ex.targetWord);
        }
      }
    });

    // 5 recommended review words
    const recommended = weakWords.slice(0, 5);
    if (recommended.length < 5) {
      vocabulary.forEach((v) => {
        if (recommended.length < 5 && !recommended.includes(v.term) && v.priority === 'must') {
          recommended.push(v.term);
        }
      });
    }

    const sessionSummary: TestSessionResult = {
      lessonId,
      lessonTitle,
      completedAt: new Date().toISOString(),
      totalQuestions: activeExercises.length,
      correctQuestions: correctCount,
      percentage,
      masteredWords,
      weakWords,
      results: resultsList,
      recommendedReviewWords: recommended,
    };

    onSaveTestResult(sessionSummary);
  };

  const handleRetryIncorrect = () => {
    const incorrectExercises = activeExercises.filter(
      (ex) => results[ex.id] && !results[ex.id].isCorrect
    );
    if (incorrectExercises.length > 0) {
      setActiveExercises(incorrectExercises);
      setCurrentIndex(0);
      setUserAnswers({});
      setResults({});
      setMatchedPairs({});
      setMatchedCollocations({});
      setIsFinished(false);
    }
  };

  const handleRestartFull = () => {
    setActiveExercises(exercises);
    setCurrentIndex(0);
    setUserAnswers({});
    setResults({});
    setMatchedPairs({});
    setMatchedCollocations({});
    setIsFinished(false);
  };

  // Render Exercise UI per Type
  const renderExerciseContent = () => {
    switch (currentExercise.type) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentExercise.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentExercise.options?.map((opt, idx) => {
                const isSelected = userAnswers[currentExercise.id] === opt;
                const isAnswerChecked = !!currentResult;
                const isCorrectOption =
                  opt.trim().toLowerCase() === currentExercise.correctAnswer.trim().toLowerCase();

                let btnStyle = 'border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-white dark:bg-slate-800';
                if (isSelected) {
                  btnStyle = 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 ring-2 ring-teal-500/30';
                }
                if (isAnswerChecked) {
                  if (isCorrectOption) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerChecked}
                    onClick={() => {
                      setUserAnswers({
                        ...userAnswers,
                        [currentExercise.id]: opt,
                      });
                    }}
                    className={`p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerChecked && isCorrectOption && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrectOption && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentExercise.question}
            </p>

            {/* Word Bank if available */}
            {currentExercise.wordBank && currentExercise.wordBank.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Ngân hàng từ gợi ý (Word Bank):
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentExercise.wordBank.map((wb, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setUserAnswers({
                          ...userAnswers,
                          [currentExercise.id]: wb,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-xs font-semibold text-teal-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-teal-400 cursor-pointer"
                    >
                      {wb}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <input
                type="text"
                disabled={!!currentResult}
                value={userAnswers[currentExercise.id] || ''}
                onChange={(e) =>
                  setUserAnswers({
                    ...userAnswers,
                    [currentExercise.id]: e.target.value,
                  })
                }
                placeholder="Nhập từ hoặc cụm từ phù hợp..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>
        );

      case 'word_formation':
        return (
          <div className="space-y-4">
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentExercise.question}
            </p>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 font-medium">
              Từ gốc cần biến đổi: <strong className="font-mono text-sm uppercase">{currentExercise.rootWord || currentExercise.targetWord}</strong>
            </div>

            <div>
              <input
                type="text"
                disabled={!!currentResult}
                value={userAnswers[currentExercise.id] || ''}
                onChange={(e) =>
                  setUserAnswers({
                    ...userAnswers,
                    [currentExercise.id]: e.target.value,
                  })
                }
                placeholder="Nhập dạng từ đã chia (danh từ, tính từ, trạng từ...)..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
              />
            </div>
          </div>
        );

      case 'error_correction':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1">
                Câu có lỗi dùng từ / giới từ / collocation:
              </span>
              <p className="text-sm font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                "{currentExercise.question}"
              </p>
            </div>

            {currentExercise.hint && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                💡 <strong>Gợi ý:</strong> {currentExercise.hint}
              </p>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nhập phương án sửa (ví dụ: "to -&gt; with" hoặc từ sửa đúng):
              </label>
              <input
                type="text"
                disabled={!!currentResult}
                value={userAnswers[currentExercise.id] || ''}
                onChange={(e) =>
                  setUserAnswers({
                    ...userAnswers,
                    [currentExercise.id]: e.target.value,
                  })
                }
                placeholder="Nhập từ sai và từ đúng..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        );

      case 'match_meaning': {
        const pairs = currentExercise.pairs || [];
        const enWords = pairs.map((p) => p.en);
        const viMeanings = pairs.map((p) => p.vi);

        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {currentExercise.question}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Left column (English) */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Từ tiếng Anh
                </span>
                {enWords.map((en, idx) => {
                  const isMatched = !!matchedPairs[en];
                  const isSelected = selectedEn === en;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedEn(en)}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 ring-2 ring-teal-500/20'
                          : isMatched
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300'
                      }`}
                    >
                      {en}
                    </button>
                  );
                })}
              </div>

              {/* Right column (Vietnamese) */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nghĩa tiếng Việt
                </span>
                {viMeanings.map((vi, idx) => {
                  const isPairedWithSelected = selectedEn && matchedPairs[selectedEn] === vi;
                  const isAlreadyMatched = Object.values(matchedPairs).includes(vi);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (selectedEn) {
                          setMatchedPairs((prev) => ({
                            ...prev,
                            [selectedEn]: vi,
                          }));
                          setSelectedEn(null);
                        }
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                        isPairedWithSelected || isAlreadyMatched
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : selectedEn
                          ? 'border-teal-300 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300'
                      }`}
                    >
                      {vi}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setMatchedPairs({})}
                className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Làm lại phần ghép cặp
              </button>
            </div>
          </div>
        );
      }

      case 'collocation_builder': {
        const parts = currentExercise.collocationParts || [];
        const leftParts = parts.map((p) => p.left);
        const rightParts = parts.map((p) => p.right);

        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {currentExercise.question}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nửa đầu (Headword / Chunks)
                </span>
                {leftParts.map((l, idx) => {
                  const isSelected = selectedLeft === l;
                  const isMatched = !!matchedCollocations[l];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedLeft(l)}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 ring-2 ring-teal-500/20'
                          : isMatched
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Nửa ghép còn lại
                </span>
                {rightParts.map((r, idx) => {
                  const isMatched = Object.values(matchedCollocations).includes(r);

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (selectedLeft) {
                          setMatchedCollocations((prev) => ({
                            ...prev,
                            [selectedLeft]: r,
                          }));
                          setSelectedLeft(null);
                        }
                      }}
                      className={`w-full p-3 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all cursor-pointer ${
                        isMatched
                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : selectedLeft
                          ? 'border-teal-300 bg-teal-50/50 hover:bg-teal-100'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'vi_to_en':
      case 'personal_application':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                {currentExercise.question}
              </p>
              {currentExercise.vietnamesePrompt && (
                <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-sm font-serif italic text-teal-900 dark:text-teal-200">
                  "{currentExercise.vietnamesePrompt}"
                </div>
              )}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>
                Từ mục tiêu bắt buộc dùng: <strong className="font-mono text-teal-700 dark:text-teal-300 text-sm">{currentExercise.targetWord}</strong>
              </span>
            </div>

            <div>
              <textarea
                rows={3}
                disabled={!!currentResult || isEvaluatingAi}
                value={userAnswers[currentExercise.id] || ''}
                onChange={(e) =>
                  setUserAnswers({
                    ...userAnswers,
                    [currentExercise.id]: e.target.value,
                  })
                }
                placeholder="Nhập câu tiếng Anh tự viết của bạn vào đây. Cô Phượng Chick sẽ chấm và nhận xét chi tiết..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
              />
            </div>
          </div>
        );

      default:
        return <div>Dạng bài tập không xác định.</div>;
    }
  };

  // If Finished, show comprehensive summary
  if (isFinished) {
    const resultsList = Object.values(results);
    const correctCount = resultsList.filter((r) => r.isCorrect).length;
    const percentage = Math.round((correctCount / activeExercises.length) * 100);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto border border-amber-400/40">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black">
            Hoàn thành bài luyện tập!
          </h2>

          <div className="flex items-center justify-center gap-6 py-2">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-amber-300 font-mono">
                {percentage}%
              </span>
              <p className="text-xs text-slate-300 mt-0.5">Tỷ lệ chính xác</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-4xl font-extrabold text-white font-mono">
                {correctCount} / {activeExercises.length}
              </span>
              <p className="text-xs text-slate-300 mt-0.5">Số câu làm đúng</p>
            </div>
          </div>

          <p className="text-sm text-teal-200 italic max-w-lg mx-auto">
            {percentage >= 80
              ? '“Rất xuất sắc! Cậu đã làm chủ ngữ cảnh và collocations bài này rồi đấy!”'
              : '“Không sao cả! Hãy xem lại giải thích chi tiết và luyện lại những câu bị sai nhé!”'}
          </p>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Bảng giải thích đáp án từng câu
          </h3>

          {activeExercises.map((ex, idx) => {
            const res = results[ex.id];
            const isOk = res?.isCorrect;

            return (
              <div
                key={ex.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isOk
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-500">
                        Câu {idx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {ex.type}
                      </span>
                      {ex.targetWord && (
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                          Target: {ex.targetWord}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {ex.question}
                    </p>
                  </div>

                  {isOk ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5">
                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Đáp án của bạn:</strong> {res?.userAnswer || '(Chưa điền)'}
                  </p>
                  {ex.correctAnswer && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      <strong>Đáp án chuẩn:</strong> {ex.correctAnswer}
                    </p>
                  )}

                  {/* AI teacher feedback if present */}
                  {res?.aiEvaluation && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-bold">{res.aiEvaluation.teacherComment}</p>
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Gợi ý viết mượt hơn:</strong> "{res.aiEvaluation.betterVersion}"
                      </p>
                    </div>
                  )}

                  <p className="text-slate-600 dark:text-slate-400">
                    💡 <strong>Giải thích:</strong> {ex.explanationVi}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={handleRetryIncorrect}
            disabled={correctCount === activeExercises.length}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện lại các câu sai ({activeExercises.length - correctCount} câu)</span>
          </button>

          <button
            onClick={handleRestartFull}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Làm lại từ đầu</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header info */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Câu {currentIndex + 1} / {activeExercises.length}
          </span>
          <span className="text-xs font-semibold text-slate-500 capitalize">
            {currentExercise.type.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-32 sm:w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / activeExercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
        {renderExerciseContent()}

        {/* Feedback Section if answer is checked */}
        {currentResult && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
              currentResult.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {currentResult.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {currentResult.isCorrect ? 'Chính xác!' : 'Chưa chính xác!'}
                </p>
                {currentResult.aiEvaluation ? (
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-amber-900 dark:text-amber-200">
                      {currentResult.aiEvaluation.teacherComment}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      💡 <strong>Phiên bản chuẩn IELTS:</strong> "{currentResult.aiEvaluation.betterVersion}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed">{currentResult.feedbackVi}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-400">
            {instantGrading ? 'Chế độ: Chấm ngay sau mỗi câu' : 'Chế độ: Nộp bài cuối giờ'}
          </div>

          <div className="flex items-center gap-2">
            {!currentResult ? (
              <button
                type="button"
                disabled={isEvaluatingAi}
                onClick={handleCheckAnswer}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {isEvaluatingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cô Phượng Chick đang chấm...</span>
                  </>
                ) : (
                  <>
                    <span>Kiểm tra đáp án</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>{currentIndex < activeExercises.length - 1 ? 'Câu tiếp theo' : 'Xem tổng kết bài'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

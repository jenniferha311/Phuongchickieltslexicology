import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  ChevronDown,
  Plus,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import { Lesson, WordProgress, TestSessionResult } from './types';
import {
  loadLessons,
  saveLessons,
  loadWordProgress,
  saveWordProgress,
  loadTestHistory,
  saveTestHistory,
} from './utils/storage';
import { Navbar, TabId } from './components/Navbar';
import { LessonOverview } from './components/LessonOverview';
import { SourceInput } from './components/SourceInput';
import { VocabularyTable } from './components/VocabularyTable';
import { PhrasePatterns } from './components/PhrasePatterns';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ExercisePlayer } from './components/ExercisePlayer';
import { ProgressDashboard } from './components/ProgressDashboard';
import { TeacherMode } from './components/TeacherMode';
import { QuickQuiz } from './components/QuickQuiz';

export default function App() {
  // App State
  const [lessons, setLessons] = useState<Lesson[]>(() => loadLessons());
  const [currentLessonId, setCurrentLessonId] = useState<string>(() => {
    const loaded = loadLessons();
    return loaded.length > 0 ? loaded[0].id : '';
  });
  const [activeTab, setActiveTab] = useState<TabId>('library');
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Persistence State
  const [progressMap, setProgressMap] = useState<Record<string, WordProgress>>(() =>
    loadWordProgress()
  );
  const [testHistory, setTestHistory] = useState<TestSessionResult[]>(() =>
    loadTestHistory()
  );

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync lessons to localStorage
  useEffect(() => {
    saveLessons(lessons);
  }, [lessons]);

  // Sync progress map to localStorage
  useEffect(() => {
    saveWordProgress(progressMap);
  }, [progressMap]);

  // Sync test history to localStorage
  useEffect(() => {
    saveTestHistory(testHistory);
  }, [testHistory]);

  const currentLesson =
    lessons.find((l) => l.id === currentLessonId) || lessons[0];

  // Count starred words across all lessons
  const starredCount = useMemo(() => {
    let count = 0;
    for (const lesson of lessons) {
      for (const vocab of lesson.vocabulary) {
        if (progressMap[vocab.id]?.starred) {
          count++;
        }
      }
    }
    return count;
  }, [lessons, progressMap]);

  // Handlers
  const handleUpdateWordProgress = (progress: WordProgress) => {
    setProgressMap((prev) => ({
      ...prev,
      [progress.wordId]: progress,
    }));
  };

  const handleToggleFlashcardPattern = (patternId: string) => {
    if (!currentLesson) return;
    const currentPatterns = currentLesson.patterns || currentLesson.phrasePatterns || [];
    const updatedPatterns = currentPatterns.map((p) => {
      if (p.id === patternId) {
        return { ...p, inFlashcards: !p.inFlashcards };
      }
      return p;
    });

    const updatedLesson = {
      ...currentLesson,
      patterns: updatedPatterns,
      phrasePatterns: updatedPatterns,
    };
    handleUpdateLesson(updatedLesson);
  };

  const handleUpdateLesson = (updatedLesson: Lesson) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
    );
  };

  const handleLessonCreated = (newLesson: Lesson) => {
    setLessons((prev) => [newLesson, ...prev]);
    setCurrentLessonId(newLesson.id);
    setActiveTab('library');
  };

  const handleSaveTestResult = (result: TestSessionResult) => {
    setTestHistory((prev) => [result, ...prev]);

    // Also update individual word statuses based on exercise performance
    setProgressMap((prev) => {
      const updated = { ...prev };
      result.results.forEach((r) => {
        if (!r.targetWord) return;
        const matchingWord = currentLesson?.vocabulary.find(
          (v) => v.term.toLowerCase() === r.targetWord?.toLowerCase()
        );
        if (matchingWord) {
          const current = updated[matchingWord.id] || {
            wordId: matchingWord.id,
            status: 'not_learned',
            starred: false,
            correctCount: 0,
            incorrectCount: 0,
            lastReviewedAt: null,
          };

          if (r.isCorrect) {
            current.correctCount = (current.correctCount || 0) + 1;
            if (current.status === 'not_learned') current.status = 'somewhat';
            else if (current.status === 'somewhat' && current.correctCount >= 2) {
              current.status = 'mastered';
            }
          } else {
            current.incorrectCount = (current.incorrectCount || 0) + 1;
            current.status = 'not_learned';
          }
          current.lastReviewedAt = new Date().toISOString();
          updated[matchingWord.id] = current;
        }
      });
      return updated;
    });
  };

  const handleStartReviewWeakWords = () => {
    setActiveTab('flashcards');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeLesson={currentLesson}
        teacherMode={isTeacherMode}
        onToggleTeacherMode={() => setIsTeacherMode(!isTeacherMode)}
        darkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        starredCount={starredCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Lesson Selector Bar (when a lesson exists) */}
        {currentLesson && activeTab !== 'analyze' && activeTab !== 'quick_quiz' && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
                IELTS
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                  Đang học bài:
                </span>
                <div className="relative">
                  <select
                    value={currentLessonId}
                    onChange={(e) => {
                      setCurrentLessonId(e.target.value);
                      setActiveTab('library');
                    }}
                    className="appearance-none pr-8 py-1 font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent focus:outline-none cursor-pointer"
                  >
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id} className="dark:bg-slate-900">
                        {lesson.title} ({lesson.skill} - {lesson.section})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setActiveTab('analyze')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-bold hover:bg-teal-100 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Phân tích bài thi mới (AI)</span>
              </button>

              {isTeacherMode && (
                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'teacher'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Teacher Studio</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Tab Views */}
        <div>
          {activeTab === 'library' && currentLesson && (
            <LessonOverview
              lesson={currentLesson}
              onStartFlashcards={() => setActiveTab('flashcards')}
              onStartExercises={() => setActiveTab('exercise')}
              onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            />
          )}

          {activeTab === 'quick_quiz' && (
            <QuickQuiz
              lessons={lessons}
              progressMap={progressMap}
              onUpdateWordProgress={handleUpdateWordProgress}
              onNavigateTab={(tab) => setActiveTab(tab as TabId)}
            />
          )}

          {activeTab === 'vocab' && currentLesson && (
            <VocabularyTable
              vocabulary={currentLesson.vocabulary}
              progressMap={progressMap}
              onUpdateWordProgress={handleUpdateWordProgress}
            />
          )}

          {activeTab === 'patterns' && currentLesson && (
            <PhrasePatterns
              patterns={currentLesson.patterns || currentLesson.phrasePatterns || []}
              onToggleFlashcardPattern={handleToggleFlashcardPattern}
            />
          )}

          {activeTab === 'flashcards' && currentLesson && (
            <FlashcardDeck
              vocabulary={currentLesson.vocabulary}
              progressMap={progressMap}
              onUpdateWordProgress={handleUpdateWordProgress}
            />
          )}

          {activeTab === 'exercise' && currentLesson && (
            <ExercisePlayer
              lessonId={currentLesson.id}
              lessonTitle={currentLesson.title}
              exercises={currentLesson.exercises.filter(
                (e) => {
                  const targetObj = currentLesson.vocabulary.find(
                    (v) => v.term.toLowerCase() === e.targetWord?.toLowerCase()
                  );
                  return !targetObj || targetObj.inExercise !== false;
                }
              )}
              vocabulary={currentLesson.vocabulary}
              onSaveTestResult={handleSaveTestResult}
            />
          )}

          {activeTab === 'analyze' && (
            <SourceInput onLessonCreated={handleLessonCreated} />
          )}

          {activeTab === 'progress' && (
            <ProgressDashboard
              lessons={lessons}
              progressMap={progressMap}
              testHistory={testHistory}
              onStartReviewWeakWords={handleStartReviewWeakWords}
            />
          )}

          {activeTab === 'teacher' && currentLesson && (
            <TeacherMode
              lesson={currentLesson}
              onUpdateLesson={handleUpdateLesson}
              onCloseTeacherMode={() => {
                setIsTeacherMode(false);
                setActiveTab('library');
              }}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold">
          PhuongChick IELTS 21 Vocab Lab • Phương pháp học từ vựng ngữ cảnh chuyên sâu Cambridge IELTS 21
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Hỗ trợ trích xuất bài đọc/nghe bằng Gemini AI • Chấm bài viết tự động • Tự do xuất file Markdown, CSV & Anki
        </p>
      </footer>
    </div>
  );
}

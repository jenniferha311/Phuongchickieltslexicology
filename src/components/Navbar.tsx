import React from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  GraduationCap,
  TrendingUp,
  FolderOpen,
  Moon,
  Sun,
  ShieldCheck,
  Award
} from 'lucide-react';
import { Lesson } from '../types';
import teacherAvatarImg from '../assets/images/teacher_avatar_1790011246813.jpg';

export type TabId = 'library' | 'analyze' | 'vocab' | 'patterns' | 'flashcards' | 'exercise' | 'progress' | 'teacher';

interface NavbarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  activeLesson: Lesson | null;
  teacherMode: boolean;
  onToggleTeacherMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeLesson,
  teacherMode,
  onToggleTeacherMode,
  darkMode,
  onToggleDarkMode,
}) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'library', label: 'Kho bài học', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'vocab', label: 'Từ vựng ngữ cảnh', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'patterns', label: 'Cấu trúc & Chunks', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Flashcards 3D', icon: <Layers className="w-4 h-4" /> },
    { id: 'exercise', label: 'Luyện tập', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'analyze', label: 'AI phân tích', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'progress', label: 'Tiến độ', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b transition-colors bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200 dark:border-slate-800">
      {/* Top Banner with Friendly Teacher Reminder */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white text-xs sm:text-sm py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Award className="w-3 h-3 inline" /> Lời dặn từ Cô Phượng Chick
            </span>
            <span className="font-medium truncate">
              “Cô Phượng Chick bảo cậu nên học từ trong ngữ cảnh nhé!”
            </span>
          </div>
          {activeLesson && (
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-100 bg-emerald-800/40 px-2.5 py-0.5 rounded-full">
              <span>Đang học:</span>
              <span className="text-white font-semibold max-w-[200px] truncate">
                {activeLesson.title}
              </span>
              <span className="bg-emerald-500/30 px-1.5 py-0.2 rounded text-[10px]">
                {activeLesson.skill} {activeLesson.section}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            id="brand-logo-btn"
            onClick={() => onSelectTab('library')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <img
              src={teacherAvatarImg}
              alt="Cô Phượng Chick"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  PhuongChick
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  IELTS 21
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Vocab Lab
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-sm border border-teal-200/60 dark:border-teal-800/60'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Teacher Mode Switch */}
            <button
              id="teacher-mode-toggle-btn"
              onClick={onToggleTeacherMode}
              title="Bật/Tắt chế độ giáo viên để biên tập bài tập và từ vựng"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                teacherMode
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${teacherMode ? 'text-amber-600 dark:text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Chế độ giáo viên</span>
              <span className={`w-2 h-2 rounded-full ${teacherMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle-btn"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-2 space-x-1.5 scrollbar-none border-t border-slate-100 dark:border-slate-800/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Volume2,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  Info
} from 'lucide-react';
import { VocabularyItem, WordProgress, PriorityLevel, CefrLevel, MemoryStatus } from '../types';
import { playPronunciation } from '../utils/speech';

interface VocabularyTableProps {
  vocabulary: VocabularyItem[];
  progressMap: Record<string, WordProgress>;
  onUpdateWordProgress: (progress: WordProgress) => void;
}

export const VocabularyTable: React.FC<VocabularyTableProps> = ({
  vocabulary,
  progressMap,
  onUpdateWordProgress,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [cefrFilter, setCefrFilter] = useState<'all' | CefrLevel>('all');
  const [posFilter, setPosFilter] = useState<string>('all');
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);

  // Extract unique parts of speech
  const availablePos = Array.from(new Set(vocabulary.map((v) => v.partOfSpeech.toLowerCase())));

  // Filtered vocabulary
  const filteredWords = vocabulary.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaningVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.collocations && item.collocations.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesCefr = cefrFilter === 'all' || item.cefr === cefrFilter;
    const matchesPos = posFilter === 'all' || item.partOfSpeech.toLowerCase() === posFilter;

    return matchesSearch && matchesPriority && matchesCefr && matchesPos;
  });

  // Toggle star
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
    });
  };

  // Change memory status
  const handleChangeStatus = (wordId: string, status: MemoryStatus) => {
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
      status,
    });
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'must':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            Must learn
          </span>
        );
      case 'should':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Should learn
          </span>
        );
      case 'nice':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            Nice to know
          </span>
        );
    }
  };

  const getCefrBadge = (cefr: CefrLevel) => {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        {cefr}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm từ vựng, nghĩa tiếng Việt, collocations..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Filter dropdowns */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Mọi mức độ (Priority)</option>
              <option value="must">Must learn (Bắt buộc)</option>
              <option value="should">Should learn (Nên nhớ)</option>
              <option value="nice">Nice to know (Mở rộng)</option>
            </select>

            {/* CEFR Level Filter */}
            <select
              value={cefrFilter}
              onChange={(e) => setCefrFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Mọi cấp độ (CEFR)</option>
              <option value="B1">Band B1</option>
              <option value="B2">Band B2</option>
              <option value="C1">Band C1</option>
              <option value="C2">Band C2</option>
            </select>

            {/* Part of Speech Filter */}
            <select
              value={posFilter}
              onChange={(e) => setPosFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Mọi từ loại (POS)</option>
              {availablePos.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Results */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span>
            Hiển thị <strong className="text-slate-800 dark:text-slate-200">{filteredWords.length}</strong> / {vocabulary.length} mục từ
          </span>
          <span className="hidden sm:inline italic">
            Bấm vào bất kỳ dòng nào để xem trích dẫn câu trong bài, lỗi sai thường gặp và mẹo dùng IELTS.
          </span>
        </div>
      </div>

      {/* Vocabulary List / Cards */}
      <div className="space-y-3">
        {filteredWords.map((item) => {
          const isExpanded = expandedWordId === item.id;
          const prog = progressMap[item.id] || {
            status: 'not_learned',
            starred: false,
          };

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ${
                isExpanded
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700'
              }`}
            >
              {/* Row summary */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div
                  className="flex-1 cursor-pointer select-none"
                  onClick={() => setExpandedWordId(isExpanded ? null : item.id)}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {item.term}
                    </h3>
                    <span className="text-xs italic text-slate-500 font-serif">
                      ({item.partOfSpeech})
                    </span>
                    {getCefrBadge(item.cefr)}
                    {getPriorityBadge(item.priority)}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-mono text-teal-700 dark:text-teal-300">
                      UK: {item.ipaUk}
                    </span>
                    {item.ipaUs && item.ipaUs !== item.ipaUk && (
                      <span className="font-mono text-slate-500">
                        US: {item.ipaUs}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.meaningVi}
                  </p>
                </div>

                {/* Pronunciation & Quick Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Pronunciation UK */}
                  <button
                    onClick={() => playPronunciation(item.term, 'uk')}
                    title="Phát âm Anh-Anh"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>UK</span>
                  </button>

                  {/* Pronunciation US */}
                  <button
                    onClick={() => playPronunciation(item.term, 'us')}
                    title="Phát âm Anh-Mỹ"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>US</span>
                  </button>

                  {/* Star Toggle */}
                  <button
                    onClick={() => handleToggleStar(item.id)}
                    title={prog.starred ? 'Bỏ gắn sao' : 'Gắn sao từ khó nhớ'}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      prog.starred
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${prog.starred ? 'fill-current' : ''}`} />
                  </button>

                  {/* Expand Toggle Chevron */}
                  <button
                    onClick={() => setExpandedWordId(isExpanded ? null : item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detailed View */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 sm:p-6 space-y-4">
                  {/* English definition */}
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-white uppercase font-bold text-[10px] tracking-wider block mb-1">
                      Định nghĩa tiếng Anh:
                    </strong>
                    <span className="italic">"{item.definitionEn}"</span>
                  </div>

                  {/* Context in Passage */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block mb-1">
                      Ngữ cảnh trong bài thi:
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-serif italic mb-1">
                      "{item.originalContext}"
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      💡 <strong>Giải thích ngữ cảnh:</strong> {item.contextExplanationVi}
                    </p>
                  </div>

                  {/* Collocations and Word Family */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Collocations */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                        Collocations tự nhiên:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.collocations.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-[11px] font-medium border border-teal-200/60 dark:border-teal-800/60"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Word Family */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                        Họ từ (Word Family):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.wordFamily.length > 0 ? (
                          item.wordFamily.map((wf, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                            >
                              <strong>{wf.word}</strong> <span className="opacity-70">({wf.pos})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Không có biến thể phổ biến</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Synonyms & Antonyms */}
                  <div className="flex flex-wrap gap-4 text-xs">
                    {item.synonyms && item.synonyms.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-700 dark:text-slate-300">Từ đồng nghĩa:</strong>
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.synonyms.join(', ')}
                        </span>
                      </div>
                    )}
                    {item.antonyms && item.antonyms.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-700 dark:text-slate-300">Từ trái nghĩa:</strong>
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.antonyms.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* New Example */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Ví dụ mới & Bản dịch:
                    </span>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      "{item.exampleEn}"
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      → {item.exampleVi}
                    </p>
                  </div>

                  {/* Common Mistakes (Alert Box) */}
                  {item.commonMistakeVi && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-0.5">
                          Lỗi học sinh Việt Nam hay mắc:
                        </strong>
                        <p>{item.commonMistakeVi}</p>
                      </div>
                    </div>
                  )}

                  {/* IELTS Use advice */}
                  {item.ieltsUseVi && (
                    <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block mb-0.5">
                          Gợi ý dùng trong Writing / Speaking:
                        </strong>
                        <p>{item.ieltsUseVi}</p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Memory Status Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Mức độ ghi nhớ của bạn:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleChangeStatus(item.id, 'not_learned')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          prog.status === 'not_learned'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Chưa nhớ
                      </button>
                      <button
                        onClick={() => handleChangeStatus(item.id, 'somewhat')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          prog.status === 'somewhat'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Hơi nhớ
                      </button>
                      <button
                        onClick={() => handleChangeStatus(item.id, 'mastered')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          prog.status === 'mastered'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        Đã nhớ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredWords.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Không tìm thấy từ vựng phù hợp với bộ lọc
            </h4>
            <p className="text-xs text-slate-500">
              Hãy thử bỏ chọn bộ lọc hoặc tìm kiếm từ khóa khác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

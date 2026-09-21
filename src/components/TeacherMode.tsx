import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Check,
  X,
  Sparkles,
  Eye,
  Sliders
} from 'lucide-react';
import { Lesson, VocabularyItem, Exercise, PriorityLevel, CefrLevel } from '../types';
import { exportLessonToMarkdown, exportVocabularyToCSV } from '../utils/storage';

interface TeacherModeProps {
  lesson: Lesson;
  onUpdateLesson: (updatedLesson: Lesson) => void;
  onCloseTeacherMode: () => void;
}

export const TeacherMode: React.FC<TeacherModeProps> = ({
  lesson,
  onUpdateLesson,
  onCloseTeacherMode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'vocab' | 'exercises' | 'export_import'>('vocab');

  // Editing single word modal
  const [editingWord, setEditingWord] = useState<VocabularyItem | null>(null);

  // New word modal
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWord, setNewWord] = useState<Partial<VocabularyItem>>({
    term: '',
    ipaUk: '',
    ipaUs: '',
    partOfSpeech: 'noun',
    cefr: 'B2',
    priority: 'must',
    meaningVi: '',
    definitionEn: '',
    originalContext: '',
    contextExplanationVi: '',
    collocations: [],
    wordFamily: [],
    synonyms: [],
    antonyms: [],
    exampleEn: '',
    exampleVi: '',
    commonMistakeVi: '',
    ieltsUseVi: '',
    inExercise: true,
  });

  // Regenerating exercise state
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // Export copy notice
  const [copiedMd, setCopiedMd] = useState(false);

  // Save edited word
  const handleSaveWord = (updatedWord: VocabularyItem) => {
    const updatedVocab = lesson.vocabulary.map((w) =>
      w.id === updatedWord.id ? updatedWord : w
    );
    onUpdateLesson({
      ...lesson,
      vocabulary: updatedVocab,
      updatedAt: new Date().toISOString(),
    });
    setEditingWord(null);
  };

  // Add new word
  const handleCreateWord = () => {
    if (!newWord.term || !newWord.meaningVi) return;

    const fullWord: VocabularyItem = {
      id: `v_custom_${Date.now()}`,
      term: newWord.term.trim(),
      ipaUk: newWord.ipaUk || '',
      ipaUs: newWord.ipaUs || newWord.ipaUk || '',
      partOfSpeech: newWord.partOfSpeech || 'noun',
      cefr: (newWord.cefr as CefrLevel) || 'B2',
      priority: (newWord.priority as PriorityLevel) || 'must',
      meaningVi: newWord.meaningVi.trim(),
      definitionEn: newWord.definitionEn || '',
      originalContext: newWord.originalContext || '',
      contextExplanationVi: newWord.contextExplanationVi || '',
      collocations: newWord.collocations || [],
      wordFamily: newWord.wordFamily || [],
      synonyms: newWord.synonyms || [],
      antonyms: newWord.antonyms || [],
      exampleEn: newWord.exampleEn || '',
      exampleVi: newWord.exampleVi || '',
      commonMistakeVi: newWord.commonMistakeVi || '',
      ieltsUseVi: newWord.ieltsUseVi || '',
      inExercise: true,
    };

    onUpdateLesson({
      ...lesson,
      vocabulary: [...lesson.vocabulary, fullWord],
      updatedAt: new Date().toISOString(),
    });
    setIsAddingWord(false);
  };

  // Delete word
  const handleDeleteWord = (wordId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục từ này khỏi bài học?')) return;
    const filtered = lesson.vocabulary.filter((w) => w.id !== wordId);
    onUpdateLesson({
      ...lesson,
      vocabulary: filtered,
      updatedAt: new Date().toISOString(),
    });
  };

  // Toggle inExercise
  const handleToggleInExercise = (wordId: string) => {
    const updated = lesson.vocabulary.map((w) => {
      if (w.id === wordId) {
        return { ...w, inExercise: w.inExercise !== false ? false : true };
      }
      return w;
    });
    onUpdateLesson({
      ...lesson,
      vocabulary: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Regenerate exercise question
  const handleRegenerateQuestion = async (ex: Exercise) => {
    setRegeneratingId(ex.id);
    const targetWordObj = lesson.vocabulary.find((v) => v.term === ex.targetWord);

    try {
      const res = await fetch('/api/regenerate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: ex.type,
          targetWord: ex.targetWord,
          wordData: targetWordObj,
          currentQuestion: ex.question,
        }),
      });

      if (res.ok) {
        const newData = await res.json();
        const updatedExercises = lesson.exercises.map((item) => {
          if (item.id === ex.id) {
            return {
              ...item,
              question: newData.question || item.question,
              options: newData.options || item.options,
              correctAnswer: newData.correctAnswer || item.correctAnswer,
              wordBank: newData.wordBank || item.wordBank,
              rootWord: newData.rootWord || item.rootWord,
              explanationVi: newData.explanationVi || item.explanationVi,
            };
          }
          return item;
        });

        onUpdateLesson({
          ...lesson,
          exercises: updatedExercises,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRegeneratingId(null);
    }
  };

  // Export JSON file download
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(lesson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${lesson.title.replace(/\s+/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.vocabulary && parsed.title) {
          onUpdateLesson(parsed);
          alert('Đã nhập bài học thành công!');
        } else {
          alert('File JSON không đúng cấu trúc bài học IELTS.');
        }
      } catch (err) {
        alert('File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  // Export CSV file download
  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(exportVocabularyToCSV(lesson));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${lesson.title.replace(/\s+/g, '_')}_vocab.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    const md = exportLessonToMarkdown(lesson);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-amber-900 dark:text-amber-200">
              Bảng điều khiển Chế độ giáo viên (Teacher Studio)
            </h2>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Tùy chỉnh danh sách từ vựng, lọc từ vào bài tập, tạo lại câu hỏi AI và xuất dữ liệu in ấn.
            </p>
          </div>
        </div>

        <button
          onClick={onCloseTeacherMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>Xem như học sinh</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('vocab')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'vocab'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          1. Quản lý từ vựng ({lesson.vocabulary.length})
        </button>
        <button
          onClick={() => setActiveSubTab('exercises')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'exercises'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          2. Quản lý câu hỏi bài tập ({lesson.exercises.length})
        </button>
        <button
          onClick={() => setActiveSubTab('export_import')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'export_import'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          3. Xuất & Nhập dữ liệu
        </button>
      </div>

      {/* Sub Tab 1: Vocab Management */}
      {activeSubTab === 'vocab' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Chọn từ nào được đưa vào bài luyện tập bằng cách tích chọn checkbox.
            </span>
            <button
              onClick={() => setIsAddingWord(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mục từ thủ công</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Bài tập</th>
                    <th className="p-3">Từ vựng</th>
                    <th className="p-3">Phiên âm</th>
                    <th className="p-3">Từ loại</th>
                    <th className="p-3">Ưu tiên</th>
                    <th className="p-3">Nghĩa tiếng Việt</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lesson.vocabulary.map((word) => (
                    <tr key={word.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={word.inExercise !== false}
                          onChange={() => handleToggleInExercise(word.id)}
                          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                        {word.term}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{word.ipaUk}</td>
                      <td className="p-3 text-slate-500">{word.partOfSpeech}</td>
                      <td className="p-3">
                        <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {word.priority}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                        {word.meaningVi}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingWord(word)}
                            className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                            title="Sửa từ vựng"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteWord(word.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            title="Xóa từ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Exercise Management */}
      {activeSubTab === 'exercises' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Nếu câu hỏi do AI tạo chưa ưng ý hoặc bị mơ hồ, bạn có thể bấm nút Tạo lại câu hỏi này bằng AI.
          </p>

          <div className="space-y-3">
            {lesson.exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="font-mono text-teal-600">Câu {idx + 1}</span>
                    <span className="uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                      {ex.type}
                    </span>
                    {ex.targetWord && (
                      <span className="text-slate-500">Từ mục tiêu: {ex.targetWord}</span>
                    )}
                  </div>

                  <button
                    disabled={regeneratingId === ex.id}
                    onClick={() => handleRegenerateQuestion(ex)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${regeneratingId === ex.id ? 'animate-spin' : ''}`} />
                    <span>Tạo lại câu này</span>
                  </button>
                </div>

                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {ex.question}
                </p>

                {ex.correctAnswer && (
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    Đáp án: {ex.correctAnswer}
                  </p>
                )}

                <p className="text-slate-500 dark:text-slate-400 italic">
                  Giải thích: {ex.explanationVi}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Export & Import */}
      {activeSubTab === 'export_import' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Copy Markdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Xuất bài học ra Markdown
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sao chép toàn bộ bảng từ vựng, giải thích tiếng Việt và bài tập để dán vào Notion hoặc in ấn.
            </p>
            <button
              onClick={handleCopyMarkdown}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
            >
              {copiedMd ? 'Đã sao chép vào Clipboard!' : 'Sao chép Markdown'}
            </button>
          </div>

          {/* Export CSV */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Tải tệp Excel / CSV
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tải danh sách từ vựng gồm phiên âm, collocations, lỗi sai thường gặp để nhập vào Anki hoặc Quizlet.
            </p>
            <button
              onClick={handleExportCSV}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
            >
              Tải file CSV
            </button>
          </div>

          {/* JSON Backup & Restore */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Sao lưu & Nhập JSON
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lưu mã bài học hoàn chỉnh vào máy tính và có thể nhập lại bất kỳ lúc nào mà không sợ mất.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
              >
                Tải JSON
              </button>
              <label className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs text-center border border-slate-300 dark:border-slate-700 cursor-pointer">
                <span>Nhập JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* EDIT WORD MODAL */}
      {editingWord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Chỉnh sửa từ: {editingWord.term}
              </h3>
              <button
                onClick={() => setEditingWord(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nghĩa tiếng Việt theo ngữ cảnh bài:
                </label>
                <input
                  type="text"
                  value={editingWord.meaningVi}
                  onChange={(e) =>
                    setEditingWord({ ...editingWord, meaningVi: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phiên âm Anh-Anh (IPA UK):
                  </label>
                  <input
                    type="text"
                    value={editingWord.ipaUk}
                    onChange={(e) =>
                      setEditingWord({ ...editingWord, ipaUk: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Mức độ ưu tiên:
                  </label>
                  <select
                    value={editingWord.priority}
                    onChange={(e) =>
                      setEditingWord({
                        ...editingWord,
                        priority: e.target.value as PriorityLevel,
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  >
                    <option value="must">Must learn (Bắt buộc)</option>
                    <option value="should">Should learn (Nên nhớ)</option>
                    <option value="nice">Nice to know (Mở rộng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Ví dụ mới tiếng Anh:
                </label>
                <input
                  type="text"
                  value={editingWord.exampleEn}
                  onChange={(e) =>
                    setEditingWord({ ...editingWord, exampleEn: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Bản dịch ví dụ:
                </label>
                <input
                  type="text"
                  value={editingWord.exampleVi}
                  onChange={(e) =>
                    setEditingWord({ ...editingWord, exampleVi: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Lỗi học sinh Việt Nam hay mắc:
                </label>
                <textarea
                  rows={2}
                  value={editingWord.commonMistakeVi}
                  onChange={(e) =>
                    setEditingWord({
                      ...editingWord,
                      commonMistakeVi: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingWord(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveWord(editingWord)}
                className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-500"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW WORD MODAL */}
      {isAddingWord && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Thêm mục từ vựng mới
              </h3>
              <button
                onClick={() => setIsAddingWord(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Từ / Cụm từ tiếng Anh (*):
                </label>
                <input
                  type="text"
                  value={newWord.term}
                  onChange={(e) => setNewWord({ ...newWord, term: e.target.value })}
                  placeholder="Ví dụ: sustainable"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nghĩa tiếng Việt (*):
                </label>
                <input
                  type="text"
                  value={newWord.meaningVi}
                  onChange={(e) =>
                    setNewWord({ ...newWord, meaningVi: e.target.value })
                  }
                  placeholder="Ví dụ: bền vững, có thể duy trì lâu dài"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phiên âm IPA:
                  </label>
                  <input
                    type="text"
                    value={newWord.ipaUk}
                    onChange={(e) => setNewWord({ ...newWord, ipaUk: e.target.value })}
                    placeholder="/səˈsteɪ.nə.bəl/"
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Ưu tiên:
                  </label>
                  <select
                    value={newWord.priority}
                    onChange={(e) =>
                      setNewWord({
                        ...newWord,
                        priority: e.target.value as PriorityLevel,
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                  >
                    <option value="must">Must learn</option>
                    <option value="should">Should learn</option>
                    <option value="nice">Nice to know</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsAddingWord(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateWord}
                disabled={!newWord.term || !newWord.meaningVi}
                className="px-4 py-2 rounded-lg bg-teal-600 disabled:opacity-50 text-white font-bold text-xs hover:bg-teal-500"
              >
                Thêm mục từ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

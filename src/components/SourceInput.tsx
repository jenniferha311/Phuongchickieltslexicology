import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  AlertTriangle,
  XCircle,
  Loader2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Lesson, SkillType, StudentLevel } from '../types';

interface SourceInputProps {
  onLessonCreated: (lesson: Lesson) => void;
}

export const SourceInput: React.FC<SourceInputProps> = ({ onLessonCreated }) => {
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('Cambridge IELTS 21');
  const [test, setTest] = useState<number>(1);
  const [skill, setSkill] = useState<SkillType>('Reading');
  const [section, setSection] = useState('Passage 1');
  const [level, setLevel] = useState<StudentLevel>('6.0-6.5');
  const [itemCount, setItemCount] = useState<string>('15');
  const [text, setText] = useState('');

  // OCR state
  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrNotes, setOcrNotes] = useState<string | null>(null);
  const [suspectedParts, setSuspectedParts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // When skill changes, update default section
  const handleSkillChange = (newSkill: SkillType) => {
    setSkill(newSkill);
    if (newSkill === 'Reading') {
      setSection('Passage 1');
    } else {
      setSection('Part 1');
    }
  };

  // Handle file upload (PDF or Image)
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Supported formats: PDF, PNG, JPG, WEBP
    const validMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      setErrorMessage('Vui lòng tải lên tệp PDF hoặc ảnh (PNG, JPG, WEBP).');
      return;
    }

    setErrorMessage(null);
    setIsExtracting(true);
    setOcrNotes(null);
    setSuspectedParts([]);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const res = await fetch('/api/extract-document', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64Data,
              mimeType: file.type,
              fileName: file.name,
            }),
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Trích xuất văn bản thất bại.');
          }

          const data = await res.json();
          setText(data.extractedText || '');
          if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
          }

          if (data.confidenceNotes) {
            setOcrNotes(data.confidenceNotes);
          }
          if (Array.isArray(data.suspectedParts) && data.suspectedParts.length > 0) {
            setSuspectedParts(data.suspectedParts);
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Không thể trích xuất văn bản từ tệp này.');
        } finally {
          setIsExtracting(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (e: any) {
      setErrorMessage('Lỗi đọc tệp từ máy tính: ' + e.message);
      setIsExtracting(false);
    }
  };

  // Drag and drop events
  const [isDragging, setIsDragging] = useState(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Start AI analysis
  const handleAnalyze = async () => {
    if (!text || text.trim().length < 30) {
      setErrorMessage('Vui lòng dán hoặc tải lên nội dung bài học (tối thiểu 30 ký tự).');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep(1);

    // Step simulation timers for pleasant visual feedback
    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 2400);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/analyze-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          title: title || `${source} Test ${test} ${skill} ${section}`,
          source,
          test,
          skill,
          section,
          level,
          itemCount,
          text,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi phân tích bài học.');
      }

      const data = await response.json();
      if (data.lesson) {
        onLessonCreated(data.lesson);
      } else {
        throw new Error('Định dạng dữ liệu trả về từ AI không hợp lệ.');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      if (err.name === 'AbortError') {
        setErrorMessage('Đã hủy quá trình phân tích theo yêu cầu.');
      } else {
        setErrorMessage(err.message || 'Có lỗi xảy ra trong quá trình AI phân tích.');
      }
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const stepsList = [
    'Đọc hiểu và tóm tắt 3-5 ý chính nội dung bài thi',
    'Lọc danh sách từ vựng học thuật theo mục tiêu điểm số',
    'Phân tích chuyên sâu (IPA, ngữ cảnh, collocations, lỗi sai thường gặp)',
    'Trích xuất cấu trúc và cụm từ (useful chunks)',
    'Khởi tạo bộ bài tập tương tác và câu hỏi ứng dụng',
  ];

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Reading & Listening Analyzer</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Phân tích bài học IELTS 21 mới
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Tải lên ảnh chụp đề, file PDF hoặc dán trực tiếp đoạn trích bài đọc/bài nghe. AI sẽ tự động chiết xuất toàn bộ từ vựng then chốt, ngữ cảnh và bài tập.
        </p>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Row 1: Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Tên bài học (Lesson Title)
          </label>
          <input
            id="input-lesson-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: The Evolution of Urban Green Spaces"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Row 2: Source, Test, Skill, Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Nguồn tài liệu
            </label>
            <select
              id="input-lesson-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Cambridge IELTS 21">Cambridge IELTS 21</option>
              <option value="Cambridge IELTS 20">Cambridge IELTS 20</option>
              <option value="Bài do người dùng nhập">Bài do người dùng nhập</option>
              <option value="Báo chí học thuật (The Guardian, BBC)">Báo chí học thuật (The Guardian, BBC)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Test
            </label>
            <select
              id="input-lesson-test"
              value={test}
              onChange={(e) => setTest(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={1}>Test 1</option>
              <option value={2}>Test 2</option>
              <option value={3}>Test 3</option>
              <option value={4}>Test 4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Kỹ năng
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => handleSkillChange('Reading')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  skill === 'Reading'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Reading
              </button>
              <button
                type="button"
                onClick={() => handleSkillChange('Listening')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  skill === 'Listening'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Listening
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Phần bài thi
            </label>
            <select
              id="input-lesson-section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {skill === 'Reading' ? (
                <>
                  <option value="Passage 1">Passage 1</option>
                  <option value="Passage 2">Passage 2</option>
                  <option value="Passage 3">Passage 3</option>
                </>
              ) : (
                <>
                  <option value="Part 1">Part 1</option>
                  <option value="Part 2">Part 2</option>
                  <option value="Part 3">Part 3</option>
                  <option value="Part 4">Part 4</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Row 3: Target Band Level & Item Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Mức độ học sinh mục tiêu
            </label>
            <select
              id="input-lesson-level"
              value={level}
              onChange={(e) => setLevel(e.target.value as StudentLevel)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="Foundation">Foundation (Band 4.0 - 4.5)</option>
              <option value="5.0-5.5">Mục tiêu 5.0 – 5.5 (Tiền trung cấp)</option>
              <option value="6.0-6.5">Mục tiêu 6.0 – 6.5 (Trung cấp học thuật)</option>
              <option value="7.0+">Mục tiêu 7.0+ (Nâng cao & Collocations C1/C2)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Số lượng từ muốn phân tích
            </label>
            <select
              id="input-lesson-itemcount"
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="10">10 từ trọng tâm</option>
              <option value="15">15 từ (Khuyên dùng)</option>
              <option value="20">20 từ</option>
              <option value="30">30 từ chuyên sâu</option>
              <option value="auto">Tự động chọn theo độ dài bài</option>
            </select>
          </div>
        </div>

        {/* Upload Zone (Drag & Drop or Pick PDF/Image) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Tải lên tệp PDF hoặc ảnh chụp bài thi
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                {isExtracting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isExtracting
                  ? 'Đang nhận diện ký tự & trích xuất văn bản qua AI OCR...'
                  : 'Kéo thả PDF / ảnh chụp vào đây hoặc bấm để chọn tệp'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hỗ trợ file PDF Cambridge, ảnh chụp đề thi (PNG, JPG). AI sẽ giữ nguyên chữ gốc, không tự bịa đoạn thiếu.
              </p>
            </div>
          </div>
        </div>

        {/* OCR Result Notices (if any unclear parts) */}
        {ocrNotes && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Ghi chú từ bộ nhận diện OCR:</p>
              <p className="mt-0.5">{ocrNotes}</p>
            </div>
          </div>
        )}

        {suspectedParts.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Phát hiện đoạn chữ mờ / nghi ngờ – vui lòng kiểm tra lại trước khi phân tích:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300">
              {suspectedParts.map((sp, idx) => (
                <li key={idx}>"{sp}"</li>
              ))}
            </ul>
          </div>
        )}

        {/* Text Area for Passage Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Nội dung bài đọc hoặc Audio Script (Bản xem trước & Chỉnh sửa)</span>
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {wordCount} từ • {text.length} ký tự
            </span>
          </div>

          <textarea
            id="input-lesson-text"
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dán nội dung bài đọc Reading Passage hoặc bản Audio Script bài Listening vào đây..."
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Active Analysis Progress Card */}
        {isAnalyzing && (
          <div className="p-6 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-teal-900 dark:text-teal-200 font-bold text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600 dark:text-teal-400" />
                <span>AI đang phân tích bài học theo tiêu chuẩn IELTS...</span>
              </div>
              <button
                type="button"
                onClick={handleCancelAnalysis}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors"
              >
                Hủy phân tích
              </button>
            </div>

            {/* 5-step progress bar */}
            <div className="space-y-2">
              {stepsList.map((stepDesc, idx) => {
                const stepNum = idx + 1;
                const isDone = analysisStep > stepNum;
                const isCurrent = analysisStep === stepNum;
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 flex items-center justify-center text-[10px] text-slate-400">
                        {stepNum}
                      </div>
                    )}
                    <span
                      className={`${
                        isCurrent
                          ? 'font-bold text-teal-900 dark:text-teal-100'
                          : isDone
                          ? 'text-slate-600 dark:text-slate-400 line-through'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      Bước {stepNum}: {stepDesc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            id="start-analyze-lesson-btn"
            type="button"
            disabled={isAnalyzing || isExtracting || !text.trim()}
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-teal-600/20 transition-all cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang phân tích bài học...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Phân tích bài học (Bắt đầu)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import { Lesson, WordProgress, TestSessionResult } from '../types';
import { DEFAULT_LESSONS } from '../data/defaultLessons';

const LESSONS_KEY = 'phuongchick_ielts_lessons';
const ACTIVE_LESSON_ID_KEY = 'phuongchick_active_lesson_id';
const WORD_PROGRESS_KEY = 'phuongchick_word_progress';
const TEST_HISTORY_KEY = 'phuongchick_test_history';

export function getStoredLessons(): Lesson[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) {
      saveStoredLessons(DEFAULT_LESSONS);
      return DEFAULT_LESSONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    saveStoredLessons(DEFAULT_LESSONS);
    return DEFAULT_LESSONS;
  } catch (e) {
    console.error('Failed to load lessons from localStorage:', e);
    return DEFAULT_LESSONS;
  }
}

export function saveStoredLessons(lessons: Lesson[]): void {
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch (e) {
    console.error('Failed to save lessons to localStorage:', e);
  }
}

export function getActiveLessonId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_LESSON_ID_KEY);
    if (id) return id;
  } catch {}
  return DEFAULT_LESSONS[0].id;
}

export function setActiveLessonId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_LESSON_ID_KEY, id);
  } catch {}
}

export function getWordProgressMap(): Record<string, WordProgress> {
  try {
    const raw = localStorage.getItem(WORD_PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
    const initialMap: Record<string, WordProgress> = {
      v1: { wordId: 'v1', status: 'somewhat', starred: true, correctCount: 1, incorrectCount: 0, lastReviewedAt: null },
      v3: { wordId: 'v3', status: 'not_learned', starred: true, correctCount: 0, incorrectCount: 1, lastReviewedAt: null },
      v4: { wordId: 'v4', status: 'not_learned', starred: true, correctCount: 0, incorrectCount: 0, lastReviewedAt: null },
      v8: { wordId: 'v8', status: 'somewhat', starred: true, correctCount: 2, incorrectCount: 1, lastReviewedAt: null },
    };
    try {
      localStorage.setItem(WORD_PROGRESS_KEY, JSON.stringify(initialMap));
    } catch {}
    return initialMap;
  } catch {}
  return {};
}

export const loadLessons = getStoredLessons;
export const saveLessons = saveStoredLessons;
export const loadWordProgress = getWordProgressMap;

export function saveWordProgress(progress: WordProgress | Record<string, WordProgress>): void {
  try {
    if ('wordId' in progress && typeof (progress as any).wordId === 'string') {
      const single = progress as WordProgress;
      const current = getWordProgressMap();
      current[single.wordId] = {
        ...current[single.wordId],
        ...single,
        lastReviewedAt: new Date().toISOString(),
      };
      localStorage.setItem(WORD_PROGRESS_KEY, JSON.stringify(current));
    } else {
      localStorage.setItem(WORD_PROGRESS_KEY, JSON.stringify(progress));
    }
  } catch (e) {
    console.error('Error saving word progress:', e);
  }
}

export const loadTestHistory = getTestHistory;

export function saveTestHistory(history: TestSessionResult[]): void {
  try {
    localStorage.setItem(TEST_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch (e) {
    console.error('Error saving test history:', e);
  }
}

export function getTestHistory(): TestSessionResult[] {
  try {
    const raw = localStorage.getItem(TEST_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveTestResult(result: TestSessionResult): void {
  try {
    const history = getTestHistory();
    history.unshift(result);
    // Keep last 50 tests
    const capped = history.slice(0, 50);
    localStorage.setItem(TEST_HISTORY_KEY, JSON.stringify(capped));
  } catch (e) {
    console.error('Error saving test result:', e);
  }
}

// Export Lesson to Markdown
export function exportLessonToMarkdown(lesson: Lesson): string {
  let md = `# ${lesson.title}\n`;
  md += `**Nguồn:** ${lesson.source} | **Kỹ năng:** ${lesson.skill} - ${lesson.section} | **Trình độ:** ${lesson.level}\n\n`;

  md += `## 1. Tóm tắt nội dung\n`;
  lesson.summaryVi.forEach((s) => {
    md += `- ${s}\n`;
  });
  md += `\n**Chủ đề:** ${lesson.topicFields.join(', ')}\n\n`;

  if (lesson.structureAnalysisVi) {
    md += `**Phân tích cấu trúc / bối cảnh:**\n${lesson.structureAnalysisVi}\n\n`;
  }

  md += `## 2. Danh sách từ vựng trọng tâm\n\n`;
  md += `| Từ vựng | Phiên âm | Từ loại | CEFR | Mức độ | Nghĩa tiếng Việt | Collocations | Ví dụ |\n`;
  md += `|---|---|---|---|---|---|---|---|\n`;

  lesson.vocabulary.forEach((v) => {
    const collocations = (v.collocations || []).join('; ');
    const example = `${v.exampleEn} (${v.exampleVi})`;
    md += `| **${v.term}** | UK: ${v.ipaUk} / US: ${v.ipaUs} | ${v.partOfSpeech} | ${v.cefr} | ${v.priority.toUpperCase()} | ${v.meaningVi} | ${collocations} | ${example} |\n`;
  });

  md += `\n## 3. Cấu trúc & Chunks đáng nhớ\n\n`;
  lesson.patterns.forEach((p, idx) => {
    md += `### ${idx + 1}. \`${p.formula}\`\n`;
    md += `- **Nghĩa:** ${p.meaningVi}\n`;
    md += `- **Cách dùng:** ${p.usageVi}\n`;
    if (p.originalExample) md += `- **Trong bài:** *${p.originalExample}*\n`;
    md += `- **Ví dụ mới:** *${p.newExample}*\n`;
    if (p.mistakeVi) md += `- **Lỗi học sinh VN hay mắc:** ${p.mistakeVi}\n`;
    md += `\n`;
  });

  md += `## 4. Bài tập thực hành\n\n`;
  lesson.exercises.forEach((ex, idx) => {
    md += `**Câu ${idx + 1} (${ex.type}):** ${ex.question}\n`;
    if (ex.options && ex.options.length > 0) {
      ex.options.forEach((opt) => {
        md += `  - [ ] ${opt}\n`;
      });
    }
    md += `> **Đáp án:** ${ex.correctAnswer}\n`;
    md += `> **Giải thích:** ${ex.explanationVi}\n\n`;
  });

  return md;
}

// Export Lesson to CSV
export function exportVocabularyToCSV(lesson: Lesson): string {
  const headers = ['Term', 'IPA UK', 'IPA US', 'POS', 'CEFR', 'Priority', 'Meaning (VI)', 'Definition (EN)', 'Collocations', 'Example (EN)', 'Example (VI)', 'Common Mistake (VI)', 'IELTS Tip'];
  const rows = lesson.vocabulary.map((v) => [
    `"${v.term}"`,
    `"${v.ipaUk}"`,
    `"${v.ipaUs}"`,
    `"${v.partOfSpeech}"`,
    `"${v.cefr}"`,
    `"${v.priority}"`,
    `"${(v.meaningVi || '').replace(/"/g, '""')}"`,
    `"${(v.definitionEn || '').replace(/"/g, '""')}"`,
    `"${(v.collocations || []).join('; ').replace(/"/g, '""')}"`,
    `"${(v.exampleEn || '').replace(/"/g, '""')}"`,
    `"${(v.exampleVi || '').replace(/"/g, '""')}"`,
    `"${(v.commonMistakeVi || '').replace(/"/g, '""')}"`,
    `"${(v.ieltsUseVi || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

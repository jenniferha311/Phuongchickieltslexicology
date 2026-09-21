export type CefrLevel = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type PriorityLevel = 'must' | 'should' | 'nice';
export type MemoryStatus = 'not_learned' | 'somewhat' | 'mastered';
export type SkillType = 'Reading' | 'Listening';
export type StudentLevel = 'Foundation' | '5.0-5.5' | '6.0-6.5' | '7.0+';

export interface WordFamilyMember {
  word: string;
  pos: string;
}

export interface VocabularyItem {
  id: string;
  term: string;
  ipaUk: string;
  ipaUs: string;
  partOfSpeech: string;
  cefr: CefrLevel;
  priority: PriorityLevel;
  meaningVi: string;
  definitionEn: string;
  originalContext: string;
  contextExplanationVi: string;
  collocations: string[];
  wordFamily: WordFamilyMember[];
  synonyms: string[];
  antonyms: string[];
  exampleEn: string;
  exampleVi: string;
  commonMistakeVi: string;
  ieltsUseVi: string;
  inExercise?: boolean; // For teacher mode selection
}

export interface PhrasePattern {
  id: string;
  type: 'collocation' | 'pattern' | 'phrasal_verb_idiom';
  formula: string;
  meaningVi: string;
  usageVi: string;
  originalExample: string;
  newExample: string;
  mistakeVi: string;
  inFlashcards?: boolean;
}

export type ExerciseType =
  | 'match_meaning'
  | 'multiple_choice'
  | 'fill_blank'
  | 'collocation_builder'
  | 'word_formation'
  | 'error_correction'
  | 'vi_to_en'
  | 'personal_application';

export interface Exercise {
  id: string;
  type: ExerciseType;
  targetWordId?: string;
  targetWord?: string;
  question: string;
  options?: string[]; // Multiple choice
  correctAnswer: string; // Or JSON string for complex answers
  wordBank?: string[]; // Fill blank
  pairs?: { en: string; vi: string }[]; // Match meaning
  collocationParts?: { left: string; right: string }[]; // Collocation builder
  rootWord?: string; // Word formation
  hint?: string;
  explanationVi: string;
  vietnamesePrompt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  source: string;
  test: number;
  skill: SkillType;
  section: string;
  level: StudentLevel;
  summaryVi: string[];
  topicFields: string[];
  structureAnalysisVi?: string; // Reading paragraph breakdown or Listening context
  originalText: string;
  vocabulary: VocabularyItem[];
  patterns: PhrasePattern[];
  phrasePatterns?: PhrasePattern[]; // Alias for patterns
  materialType?: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

export interface WordProgress {
  wordId: string;
  status: MemoryStatus;
  starred: boolean;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: string | null;
  lastMistake?: string;
}

export interface ExerciseResult {
  exerciseId: string;
  type: ExerciseType;
  targetWord: string;
  userAnswer: string;
  isCorrect: boolean;
  score?: number; // 0-100 for open ended
  feedbackVi: string;
  aiEvaluation?: {
    usedTargetWord: boolean;
    grammarAndCollocationOk: boolean;
    naturalness: string;
    betterVersion: string;
    teacherComment: string; // "Cô Phượng Chick bảo cậu nên..."
  };
}

export interface TestSessionResult {
  lessonId: string;
  lessonTitle: string;
  completedAt: string;
  totalQuestions: number;
  correctQuestions: number;
  percentage: number;
  masteredWords: string[];
  weakWords: string[];
  results: ExerciseResult[];
  recommendedReviewWords: string[];
}

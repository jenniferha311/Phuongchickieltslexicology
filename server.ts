import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint: Extract document (OCR from images or PDF text)
app.post('/api/extract-document', async (req, res) => {
  try {
    const { fileData, mimeType, fileName } = req.body;

    if (!fileData || !mimeType) {
      return res.status(400).json({ error: 'Thiếu dữ liệu tệp (fileData) hoặc định dạng MIME.' });
    }

    const ai = getGenAI();

    // Clean base64 if it has data URL prefix
    const base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;

    const prompt = `Trích xuất trung thực và chính xác toàn bộ văn bản tiếng Anh của bài thi IELTS từ tài liệu đính kèm này (${fileName || 'tài liệu'}).
Quy tắc quan trọng:
1. Giữ nguyên cấu trúc các đoạn văn, tiêu đề (nếu có).
2. KHÔNG được tự ý bịa thêm câu chữ hay tự ý hoàn thiện các từ bị rách/mất nét.
3. Nếu có từ hoặc đoạn nào bị mờ, khó đọc, hoặc OCR không chắc chắn 100%, hãy đánh dấu chính xác bằng ký hiệu [unclear: ...?] và liệt kê các đoạn nghi ngờ này.
4. Trả về định dạng JSON gồm các trường:
   - "extractedText": toàn bộ văn bản trích xuất được
   - "confidenceNotes": nhận xét ngắn gọn về chất lượng hình ảnh / tài liệu bằng tiếng Việt
   - "suspectedParts": mảng chứa các từ hoặc cụm từ bị mờ/nghi ngờ`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/extract-document:', error);
    return res.status(500).json({
      error: error?.message || 'Có lỗi xảy ra khi trích xuất văn bản từ tài liệu.',
    });
  }
});

// Endpoint: Analyze Lesson
app.post('/api/analyze-lesson', async (req, res) => {
  try {
    const {
      title,
      source,
      test,
      skill,
      section,
      level,
      itemCount,
      text,
    } = req.body;

    if (!text || text.trim().length < 30) {
      return res.status(400).json({
        error: 'Văn bản cung cấp quá ngắn để phân tích từ vựng IELTS (tối thiểu 30 ký tự).',
      });
    }

    const ai = getGenAI();

    const targetCount = itemCount && itemCount !== 'auto' ? Number(itemCount) : 15;

    const systemInstruction = `Bạn là chuyên gia giảng dạy IELTS và từ vựng học thuật cho học sinh Việt Nam. Hãy phân tích CHỈ văn bản mà người dùng cung cấp. Không tái tạo các phần của sách không có trong đầu vào và không bịa dữ liệu.

Mục tiêu là biến văn bản thành một bài học từ vựng có thể học và luyện tập. Chọn những từ, collocation, phrasal verb và useful chunks quan trọng, phù hợp với trình độ ${level || '6.0-6.5'}. Giải thích bằng tiếng Việt tự nhiên, chính xác và dễ hiểu. Nghĩa phải bám sát ngữ cảnh. Phân biệt nghĩa trong bài với nghĩa phổ biến nếu cần.

Quy trình phân tích:
Bước 1 – Tóm tắt nội dung:
- Đặt tiêu đề ngắn cho bài (nếu người dùng chưa đặt hoặc cần tối ưu).
- Tóm tắt bằng tiếng Việt từ 3–5 ý.
- Nêu chủ đề chính (topicFields).
- Với Reading, chỉ ra bố cục hoặc chức năng chính của từng đoạn (structureAnalysisVi). Với Listening, chỉ ra bối cảnh giao tiếp, người nói và mục đích.

Bước 2 & 3 – Lọc và phân tích ${targetCount} từ vựng đáng học:
Mỗi mục từ phải có:
- term, ipaUk, ipaUs, partOfSpeech, cefr (A2, B1, B2, C1, C2), priority ('must' | 'should' | 'nice').
- meaningVi: Giải thích ngắn, rõ bằng tiếng Việt theo đúng ngữ cảnh bài.
- definitionEn: Định nghĩa tiếng Anh đơn giản.
- originalContext: Câu chứa từ trong văn bản được cung cấp (chỉ trích câu ngắn cần thiết).
- contextExplanationVi: Giải thích vì sao từ mang nghĩa đó trong câu.
- collocations: 2-4 kết hợp từ tự nhiên.
- wordFamily: Các dạng từ liên quan [{ word, pos }].
- synonyms: 1-3 từ gần nghĩa.
- antonyms: từ trái nghĩa nếu hữu ích.
- exampleEn: một câu ví dụ mới phù hợp học sinh Việt Nam.
- exampleVi: dịch câu ví dụ sang tiếng Việt.
- commonMistakeVi: Lỗi dùng từ, giới từ, chính tả hoặc phát âm mà học sinh Việt Nam hay mắc.
- ieltsUseVi: Gợi ý dùng trong Speaking hoặc Writing.

Bước 4 – Cấu trúc & Cụm từ (patterns):
Tách 3-6 cụm (collocation, pattern, phrasal_verb_idiom) gồm:
- formula, meaningVi, usageVi, originalExample, newExample, mistakeVi.

Bước 5 – Hệ thống bài tập tương tác (exercises):
Tạo tối thiểu 6-8 câu hỏi thuộc các dạng khác nhau:
1. match_meaning: ghép từ với nghĩa tiếng Việt
2. multiple_choice: câu có chỗ trống, 4 lựa chọn cùng từ loại
3. fill_blank: điền từ vào câu mới có wordBank
4. collocation_builder: ghép 2 nửa collocation
5. word_formation: cho từ gốc (rootWord) biến đổi dạng đúng
6. error_correction: câu có lỗi dùng từ/giới từ, yêu cầu sửa
7. vi_to_en: dịch câu tiếng Việt sang tiếng Anh dùng targetWord
8. personal_application: câu hỏi gợi ý học sinh tự viết liên hệ bản thân/IELTS
Các bài tập CHỈ được dùng các từ/cụm từ trong danh sách đã chọn, đáp án rõ ràng không mơ hồ.`;

    const userPrompt = `Dưới đây là thông tin và văn bản bài học IELTS cần phân tích:
- Tiêu đề: ${title || 'Chưa đặt tiêu đề'}
- Nguồn: ${source || 'Cambridge IELTS 21'} (Test ${test || 1}, ${skill || 'Reading'} - ${section || 'Passage 1'})
- Trình độ học sinh: ${level || '6.0-6.5'}
- Số lượng từ mục tiêu: khoảng ${targetCount} từ
- Nội dung văn bản:
"""
${text}
"""

Hãy phân tích toàn bộ và trả về đúng JSON theo cấu trúc:
{
  "title": string,
  "summaryVi": string[],
  "topicFields": string[],
  "structureAnalysisVi": string,
  "vocabulary": [
    {
      "id": string,
      "term": string,
      "ipaUk": string,
      "ipaUs": string,
      "partOfSpeech": string,
      "cefr": "A2" | "B1" | "B2" | "C1" | "C2",
      "priority": "must" | "should" | "nice",
      "meaningVi": string,
      "definitionEn": string,
      "originalContext": string,
      "contextExplanationVi": string,
      "collocations": string[],
      "wordFamily": [{"word": string, "pos": string}],
      "synonyms": string[],
      "antonyms": string[],
      "exampleEn": string,
      "exampleVi": string,
      "commonMistakeVi": string,
      "ieltsUseVi": string
    }
  ],
  "patterns": [
    {
      "id": string,
      "type": "collocation" | "pattern" | "phrasal_verb_idiom",
      "formula": string,
      "meaningVi": string,
      "usageVi": string,
      "originalExample": string,
      "newExample": string,
      "mistakeVi": string
    }
  ],
  "exercises": [
    {
      "id": string,
      "type": "match_meaning" | "multiple_choice" | "fill_blank" | "collocation_builder" | "word_formation" | "error_correction" | "vi_to_en" | "personal_application",
      "targetWord": string,
      "question": string,
      "options": string[],
      "correctAnswer": string,
      "wordBank": string[],
      "pairs": [{"en": string, "vi": string}],
      "collocationParts": [{"left": string, "right": string}],
      "rootWord": string,
      "vietnamesePrompt": string,
      "explanationVi": string
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);

    // Ensure IDs are present and inExercise flag is set
    const vocabulary = (parsed.vocabulary || []).map((v: any, index: number) => ({
      ...v,
      id: v.id || `v_${Date.now()}_${index}`,
      inExercise: true,
      synonyms: v.synonyms || [],
      antonyms: v.antonyms || [],
      collocations: v.collocations || [],
      wordFamily: v.wordFamily || [],
    }));

    const patterns = (parsed.patterns || []).map((p: any, index: number) => ({
      ...p,
      id: p.id || `p_${Date.now()}_${index}`,
      inFlashcards: true,
    }));

    const exercises = (parsed.exercises || []).map((e: any, index: number) => ({
      ...e,
      id: e.id || `ex_${Date.now()}_${index}`,
    }));

    const lessonData = {
      id: `lesson_${Date.now()}`,
      title: parsed.title || title || 'IELTS Lesson',
      source: source || 'Cambridge IELTS 21',
      test: Number(test) || 1,
      skill: skill || 'Reading',
      section: section || 'Passage 1',
      level: level || '6.0-6.5',
      summaryVi: parsed.summaryVi || [],
      topicFields: parsed.topicFields || [],
      structureAnalysisVi: parsed.structureAnalysisVi || '',
      originalText: text,
      vocabulary,
      patterns,
      exercises,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res.json({ lesson: lessonData });
  } catch (error: any) {
    console.error('Error in /api/analyze-lesson:', error);
    return res.status(500).json({
      error: error?.message || 'Có lỗi xảy ra khi phân tích bài học bằng AI.',
    });
  }
});

// Endpoint: Evaluate writing for open exercises (vi_to_en, personal_application)
app.post('/api/evaluate-writing', async (req, res) => {
  try {
    const { question, targetWord, studentAnswer, vietnamesePrompt, type } = req.body;

    if (!studentAnswer || studentAnswer.trim().length === 0) {
      return res.status(400).json({ error: 'Chưa có câu trả lời của học sinh.' });
    }

    const ai = getGenAI();

    const prompt = `Bạn là Cô Phượng Chick - giáo viên IELTS thân thiện, tận tâm và sắc sảo của học sinh Việt Nam.
Hãy đánh giá câu viết sau đây của học sinh:
- Loại bài: ${type === 'vi_to_en' ? 'Dịch câu Việt sang Anh' : 'Tự viết câu ứng dụng cá nhân'}
- Yêu cầu bài: ${question}
${vietnamesePrompt ? `- Câu tiếng Việt gốc: "${vietnamesePrompt}"` : ''}
- Từ mục tiêu cần dùng: "${targetWord}"
- Câu học sinh đã viết: "${studentAnswer}"

Hãy đánh giá khách quan và mang tính xây dựng cao:
1. usedTargetWord: (true/false) Học sinh đã dùng đúng từ mục tiêu chưa (cả dạng từ và ngữ nghĩa)?
2. grammarAndCollocationOk: (true/false) Ngữ pháp và collocation có chuẩn xác không?
3. naturalness: Nhận xét độ tự nhiên của câu (bằng tiếng Việt ngắn gọn).
4. betterVersion: Một phiên bản viết lại mượt mà, đạt chuẩn IELTS Band 7.0+ nhưng vẫn giữ nguyên ý tưởng ban đầu của học sinh.
5. teacherComment: Lời nhận xét và hướng dẫn trực tiếp của cô bắt đầu bằng cụm: "Cô Phượng Chick bảo cậu nên...". Phải chỉ rõ lỗi sai (nếu có) và mẹo ghi nhớ cho học sinh Việt Nam.
6. score: Điểm số từ 0 đến 100.
7. isCorrect: (true/false) coi như đạt yêu cầu bài tập hay cần sửa lại.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            usedTargetWord: { type: Type.BOOLEAN },
            grammarAndCollocationOk: { type: Type.BOOLEAN },
            naturalness: { type: Type.STRING },
            betterVersion: { type: Type.STRING },
            teacherComment: { type: Type.STRING },
          },
          required: [
            'isCorrect',
            'score',
            'usedTargetWord',
            'grammarAndCollocationOk',
            'naturalness',
            'betterVersion',
            'teacherComment',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/evaluate-writing:', error);
    return res.status(500).json({
      error: error?.message || 'Có lỗi xảy ra khi chấm bài viết.',
    });
  }
});

// Endpoint: Regenerate single exercise question for Teacher Mode
app.post('/api/regenerate-question', async (req, res) => {
  try {
    const { exerciseType, targetWord, wordData, currentQuestion } = req.body;

    const ai = getGenAI();

    const prompt = `Bạn là giáo viên thiết kế đề thi IELTS. Hãy tạo LẠI một câu hỏi bài tập mới dạng "${exerciseType}" cho từ mục tiêu "${targetWord}".
Thông tin từ:
- Nghĩa: ${wordData?.meaningVi || ''}
- Collocations: ${(wordData?.collocations || []).join(', ')}
- Word family: ${JSON.stringify(wordData?.wordFamily || [])}
- Câu hỏi cũ không ưng ý: "${currentQuestion || ''}"

Tạo một câu hỏi mới mẻ, tự nhiên, bẫy hợp lý và có giải thích chi tiết bằng tiếng Việt.
Trả về JSON chứa:
- question: nội dung câu hỏi
- options: (nếu trắc nghiệm) 4 lựa chọn
- correctAnswer: đáp án đúng
- wordBank: (nếu điền từ)
- rootWord: (nếu word formation)
- explanationVi: giải thích chi tiết tại sao đúng`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/regenerate-question:', error);
    return res.status(500).json({
      error: error?.message || 'Có lỗi khi tạo lại câu hỏi.',
    });
  }
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

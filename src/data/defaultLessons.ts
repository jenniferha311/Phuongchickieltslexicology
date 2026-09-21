import { Lesson } from '../types';

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'cam21-test1-reading-p1',
    title: 'The Evolution of Urban Green Spaces',
    source: 'Cambridge IELTS 21 – Test 1',
    test: 1,
    skill: 'Reading',
    section: 'Passage 1',
    level: '6.0-6.5',
    summaryVi: [
      'Bài đọc phân tích quá trình chuyển đổi của không gian xanh đô thị từ các công viên truyền thống sang các hệ sinh thái đa chức năng.',
      'Lợi ích sinh thái: giảm hiệu ứng đảo nhiệt đô thị (urban heat island) và tăng cường khả năng thoát nước mưa tự nhiên.',
      'Tác động xã hội: cải thiện sức khỏe tinh thần và sự gắn kết cộng đồng dân cư thành thị.',
      'Thách thức quy hoạch: cân bằng giữa nhu cầu đất ở, hạ tầng thương mại và duy trì mảng xanh bền vững.'
    ],
    topicFields: ['Urban Planning', 'Environmental Sustainability', 'Public Health', 'Ecology'],
    structureAnalysisVi: 'Đoạn A: Giới thiệu lịch sử công viên đô thị thế kỷ 19; Đoạn B: Khủng hoảng bê tông hóa và ô nhiễm; Đoạn C: Sự xuất hiện của khái niệm "hạ tầng xanh" (green infrastructure); Đoạn D: Minh chứng thực nghiệm tại Singapore và Copenhagen; Đoạn E: Định hướng quy hoạch cho các siêu đô thị tương lai.',
    originalText: `Urban green spaces have evolved dramatically over the past century. Historically conceived as aesthetic sanctuaries for nineteenth-century city dwellers to escape industrial grime, modern parks are now recognized as vital components of urban infrastructure. 

Contemporary environmental planners assert that integrating vegetation into metropolitan areas yields quantifiable ecological dividends. Foremost among these is the mitigation of the urban heat island effect, wherein concrete surfaces absorb and re-radiate thermal energy. Strategically dispersed foliage fosters microclimates that curb ambient temperatures by several degrees. Furthermore, permeable bioswales facilitate sustainable stormwater management, preventing urban runoff from overwhelming municipal drainage systems.

Beyond ecological resilience, empirical research underscores profound psychological benefits. Residents residing in verdant neighborhoods demonstrate lower cortisol levels and enhanced social cohesion. However, urban planners face formidable impediments. In rapidly densifying metropolises, commercial developers fiercely compete for finite land parcels. Municipalities must therefore adopt innovative architectural solutions, such as vertical gardens and living roofs, to reconcile economic imperative with environmental sustainability.`,
    vocabulary: [
      {
        id: 'v1',
        term: 'mitigation',
        ipaUk: '/ˌmɪt.ɪˈɡeɪ.ʃən/',
        ipaUs: '/ˌmɪt̬.əˈɡeɪ.ʃən/',
        partOfSpeech: 'noun',
        cefr: 'C1',
        priority: 'must',
        meaningVi: 'sự giảm nhẹ, sự xoa dịu (tác động tiêu cực, rủi ro, biến đổi khí hậu)',
        definitionEn: 'the action of reducing the severity, seriousness, or painfulness of something',
        originalContext: 'Foremost among these is the mitigation of the urban heat island effect.',
        contextExplanationVi: 'Trong bài, từ này chỉ hành động giảm thiểu cường độ nhiệt độ cao và tác hại của hiệu ứng đảo nhiệt đô thị nhờ cây xanh.',
        collocations: ['mitigation strategy', 'climate change mitigation', 'risk mitigation', 'disaster mitigation'],
        wordFamily: [
          { word: 'mitigate', pos: 'verb' },
          { word: 'mitigating', pos: 'adjective' },
          { word: 'mitigative', pos: 'adjective' }
        ],
        synonyms: ['alleviation', 'reduction', 'moderation'],
        antonyms: ['exacerbation', 'aggravation'],
        exampleEn: 'Urban tree planting is one of the most cost-effective mitigation strategies against rising summer temperatures.',
        exampleVi: 'Trồng cây xanh đô thị là một trong những chiến lược giảm nhẹ hiệu quả về chi phí nhất trước tình trạng nhiệt độ mùa hè tăng cao.',
        commonMistakeVi: 'Học sinh hay nhầm "mitigate" với "migrate" (di cư) hoặc dùng giới từ "mitigate against" (trong văn phong học thuật chuẩn, "mitigate" là ngoại động từ: mitigate the damage).',
        ieltsUseVi: 'Rất hữu ích cho Writing Task 2 chủ đề Environment: "effective mitigation of climate change" hoặc Speaking Part 3 khi nói về giải pháp môi trường.',
        inExercise: true
      },
      {
        id: 'v2',
        term: 'permeable',
        ipaUk: '/ˈpɜː.mi.ə.bəl/',
        ipaUs: '/ˈpɝː.mi.ə.bəl/',
        partOfSpeech: 'adjective',
        cefr: 'C1',
        priority: 'should',
        meaningVi: 'thấm nước, có thể cho chất lỏng đi qua',
        definitionEn: 'allowing liquids or gases to pass through it',
        originalContext: 'Furthermore, permeable bioswales facilitate sustainable stormwater management.',
        contextExplanationVi: 'Miêu tả các hào thấm lọc sinh học có bề mặt xốp cho phép nước mưa thấm sâu xuống đất thay vì tràn ra cống.',
        collocations: ['permeable surface', 'permeable rock', 'permeable pavement', 'highly permeable'],
        wordFamily: [
          { word: 'permeability', pos: 'noun' },
          { word: 'permeate', pos: 'verb' }
        ],
        synonyms: ['porous', 'penetrable'],
        antonyms: ['impermeable', 'waterproof'],
        exampleEn: 'Engineers recommended installing permeable concrete around school playgrounds to avoid flash floods.',
        exampleVi: 'Các kỹ sư khuyến nghị lắp đặt bê tông thấm nước xung quanh sân trường để tránh ngập úng cục bộ.',
        commonMistakeVi: 'Hay viết sai chính tả đuôi "-able" thành "-ible", và nhầm lẫn với "permanent" (vĩnh viễn).',
        ieltsUseVi: 'Writing Task 1 khi miêu tả công nghệ vật liệu mới, hoặc Task 2 khi viết về cơ sở hạ tầng đô thị chống ngập lụt.',
        inExercise: true
      },
      {
        id: 'v3',
        term: 'foster',
        ipaUk: '/ˈfɒs.tər/',
        ipaUs: '/ˈfɑː.stɚ/',
        partOfSpeech: 'verb',
        cefr: 'B2',
        priority: 'must',
        meaningVi: 'thúc đẩy, nuôi dưỡng, khuyến khích (sự phát triển, quan hệ, khí hậu)',
        definitionEn: 'to encourage the development or growth of ideas or feelings; promote',
        originalContext: 'Strategically dispersed foliage fosters microclimates that curb ambient temperatures.',
        contextExplanationVi: 'Tán cây xanh tạo điều kiện và nuôi dưỡng các tiểu khí hậu mát mẻ xung quanh.',
        collocations: ['foster a sense of community', 'foster innovation', 'foster economic growth', 'foster collaboration'],
        wordFamily: [
          { word: 'fostering', pos: 'noun' }
        ],
        synonyms: ['promote', 'cultivate', 'nurture', 'encourage'],
        antonyms: ['discourage', 'suppress', 'hinder'],
        exampleEn: 'Community libraries foster a strong reading culture among suburban teenagers.',
        exampleVi: 'Các thư viện cộng đồng nuôi dưỡng văn hóa đọc mạnh mẽ trong giới trẻ ngoại thành.',
        commonMistakeVi: 'Học sinh hay lạm dụng "help" hoặc "make", trong khi "foster" mang sắc thái học thuật cao hơn rất nhiều.',
        ieltsUseVi: 'Từ vựng "vàng" cho cả 4 kỹ năng. Dùng trong Writing Task 2: "foster independent thinking in children".',
        inExercise: true
      },
      {
        id: 'v4',
        term: 'cohesion',
        ipaUk: '/kəʊˈhiː.ʒən/',
        ipaUs: '/koʊˈhiː.ʒən/',
        partOfSpeech: 'noun',
        cefr: 'C1',
        priority: 'must',
        meaningVi: 'sự gắn kết, sự cố kết (xã hội, cộng đồng, nhóm)',
        definitionEn: 'the state of sticking together or being in close agreement and harmony',
        originalContext: 'Residents residing in verdant neighborhoods demonstrate lower cortisol levels and enhanced social cohesion.',
        contextExplanationVi: 'Người sống ở khu vực nhiều cây xanh có mức độ gắn kết cộng đồng và hỗ trợ lẫn nhau cao hơn.',
        collocations: ['social cohesion', 'group cohesion', 'community cohesion', 'strengthen cohesion'],
        wordFamily: [
          { word: 'cohesive', pos: 'adjective' },
          { word: 'cohesively', pos: 'adverb' },
          { word: 'cohere', pos: 'verb' }
        ],
        synonyms: ['unity', 'solidarity', 'connectedness'],
        antonyms: ['division', 'fragmentation', 'discord'],
        exampleEn: 'Extracurricular clubs play an indispensable role in maintaining social cohesion in multicultural schools.',
        exampleVi: 'Các câu lạc bộ ngoại khóa đóng vai trò không thể thiếu trong việc duy trì sự gắn kết xã hội tại các trường đa văn hóa.',
        commonMistakeVi: 'Nhầm lẫn giữa "cohesion" (tính gắn kết nội dung/xã hội) và "coherence" (tính mạch lạc, dễ hiểu).',
        ieltsUseVi: 'Tiêu chí chấm thi IELTS Writing Task 2 có "Coherence and Cohesion"; còn về chủ đề Society, "social cohesion" là collocation điểm C1+.',
        inExercise: true
      },
      {
        id: 'v5',
        term: 'impediment',
        ipaUk: '/ɪmˈped.ɪ.mənt/',
        ipaUs: '/ɪmˈped.ə.mənt/',
        partOfSpeech: 'noun',
        cefr: 'C1',
        priority: 'should',
        meaningVi: 'trở ngại, rào cản ngăn bước tiến',
        definitionEn: 'something that makes progress, movement, or achieving of an aim difficult',
        originalContext: 'However, urban planners face formidable impediments.',
        contextExplanationVi: 'Những người quy hoạch đô thị phải đối mặt với các trở ngại to lớn (như giá đất đai, áp lực thương mại).',
        collocations: ['formidable impediment', 'serious impediment', 'impediment to progress', 'remove impediments'],
        wordFamily: [
          { word: 'impede', pos: 'verb' }
        ],
        synonyms: ['obstacle', 'barrier', 'hindrance', 'hurdle'],
        antonyms: ['catalyst', 'advantage', 'assistance'],
        exampleEn: 'High tuition fees remain a major impediment to tertiary education for rural students in Vietnam.',
        exampleVi: 'Học phí cao vẫn là một trở ngại lớn đối với việc tiếp cận giáo dục đại học của sinh viên nông thôn ở Việt Nam.',
        commonMistakeVi: 'Đi với giới từ "to" (impediment to something), không dùng "for" hay "of".',
        ieltsUseVi: 'Thay thế cực tốt cho từ "problem" hay "difficulty" thông thường trong Writing Task 2.',
        inExercise: true
      },
      {
        id: 'v6',
        term: 'reconcile',
        ipaUk: '/ˈrek.ən.saɪl/',
        ipaUs: '/ˈrek.ən.saɪl/',
        partOfSpeech: 'verb',
        cefr: 'C1',
        priority: 'must',
        meaningVi: 'dung hòa, hòa giải (hai yếu tố hoặc ý kiến đối nghịch)',
        definitionEn: 'to find a way in which two situations or beliefs that are opposed can both exist together',
        originalContext: '...to reconcile economic imperative with environmental sustainability.',
        contextExplanationVi: 'Dung hòa giữa đòi hỏi phát triển kinh tế (kiếm tiền, xây nhà) với việc bảo vệ môi trường bền vững.',
        collocations: ['reconcile A with B', 'reconcile differences', 'reconcile competing demands'],
        wordFamily: [
          { word: 'reconciliation', pos: 'noun' },
          { word: 'reconcilable', pos: 'adjective' },
          { word: 'irreconcilable', pos: 'adjective' }
        ],
        synonyms: ['harmonize', 'balance', 'integrate'],
        antonyms: ['polarize', 'alienate'],
        exampleEn: 'Modern working parents constantly struggle to reconcile demanding careers with childcare duties.',
        exampleVi: 'Các bậc phụ huynh đi làm hiện nay liên tục chật vật để dung hòa giữa sự nghiệp đòi hỏi cao với trách nhiệm chăm sóc con cái.',
        commonMistakeVi: 'Cấu trúc là "reconcile A with B", học sinh hay quên giới từ "with".',
        ieltsUseVi: 'Rất hay dùng khi kết luận bài IELTS Writing Task 2 dạng Discuss both views: "Governments must reconcile economic growth with heritage preservation."',
        inExercise: true
      },
      {
        id: 'v7',
        term: 'verdant',
        ipaUk: '/ˈvɜː.dənt/',
        ipaUs: '/ˈvɝː.dənt/',
        partOfSpeech: 'adjective',
        cefr: 'C2',
        priority: 'nice',
        meaningVi: 'xanh tươi, rợp bóng cây cỏ mát mẻ',
        definitionEn: 'covered with healthy green plants or grass',
        originalContext: 'Residents residing in verdant neighborhoods demonstrate lower cortisol levels...',
        contextExplanationVi: 'Các khu dân cư xanh tươi, nhiều cây cỏ tươi tốt.',
        collocations: ['verdant landscape', 'verdant hills', 'verdant parkland'],
        wordFamily: [
          { word: 'verdancy', pos: 'noun' }
        ],
        synonyms: ['lush', 'green', 'flourishing'],
        antonyms: ['barren', 'arid', 'desolate'],
        exampleEn: 'Da Lat is renowned for its verdant pine forests and temperate mountain climate.',
        exampleVi: 'Đà Lạt nổi tiếng với những rừng thông xanh ngắt và khí hậu miền núi mát mẻ.',
        commonMistakeVi: 'Từ mang sắc thái văn chương/miêu tả cao cấp (descriptive), tránh lạm dụng trong các bài báo cáo số liệu Task 1.',
        ieltsUseVi: 'Dùng xuất sắc trong Speaking Part 1 & 2 khi miêu tả quê hương (hometown) hoặc một công viên yêu thích.',
        inExercise: true
      }
    ],
    patterns: [
      {
        id: 'p1',
        type: 'collocation',
        formula: 'mitigate the effect/impact of something',
        meaningVi: 'giảm thiểu tác động tiêu cực của một sự việc',
        usageVi: 'Dùng khi đề xuất giải pháp cho các vấn nạn môi trường, kinh tế, xã hội.',
        originalExample: '...the mitigation of the urban heat island effect...',
        newExample: 'The government introduced strict emission standards to mitigate the impact of industrial pollution.',
        mistakeVi: 'Tránh viết "reduce the negative impact" quá nhiều lần; dùng "mitigate the adverse impact" để đạt band điểm từ vựng C1.',
        inFlashcards: true
      },
      {
        id: 'p2',
        type: 'pattern',
        formula: 'reconcile [A] with [B]',
        meaningVi: 'dung hòa, cân bằng giữa hai mục tiêu hoặc nhu cầu trái ngược',
        usageVi: 'Dùng trong câu chủ đề (topic sentence) hoặc câu kết bài (conclusion) của Writing Task 2.',
        originalExample: '...to reconcile economic imperative with environmental sustainability.',
        newExample: 'It is challenging for young graduates to reconcile their personal passions with financial stability.',
        mistakeVi: 'Dùng sai giới từ "between" thay vì "with".',
        inFlashcards: true
      },
      {
        id: 'p3',
        type: 'phrasal_verb_idiom',
        formula: 'escape the industrial grime',
        meaningVi: 'thoát khỏi khói bụi và sự ngột ngạt của nền công nghiệp',
        usageVi: 'Miêu tả nhu cầu nghỉ ngơi, tìm về thiên nhiên của con người hiện đại.',
        originalExample: '...escape industrial grime...',
        newExample: 'During weekends, city dwellers flock to eco-resorts to escape the noise and urban grime.',
        mistakeVi: 'Từ "grime" là danh từ không đếm được chỉ lớp bụi bẩn bám sâu, không dùng dạng số nhiều "grimes".',
        inFlashcards: true
      }
    ],
    exercises: [
      {
        id: 'ex1',
        type: 'match_meaning',
        question: 'Ghép từ vựng với nghĩa tiếng Việt tương ứng trong bài:',
        correctAnswer: 'matched',
        pairs: [
          { en: 'mitigation', vi: 'sự giảm nhẹ tác hại' },
          { en: 'permeable', vi: 'thấm nước, có thể thấm qua' },
          { en: 'foster', vi: 'thúc đẩy, nuôi dưỡng' },
          { en: 'cohesion', vi: 'sự gắn kết xã hội/nhóm' },
          { en: 'reconcile', vi: 'dung hòa hai mặt đối lập' }
        ],
        explanationVi: 'Tất cả các từ này đều đóng vai trò nòng cốt để hiểu rõ luận điểm về công viên và quy hoạch đô thị.'
      },
      {
        id: 'ex2',
        type: 'multiple_choice',
        targetWordId: 'v1',
        targetWord: 'mitigation',
        question: 'The municipal council prioritized flood __________ by constructing new rainwater retention basins.',
        options: ['mitigation', 'migration', 'mutation', 'moderation'],
        correctAnswer: 'mitigation',
        explanationVi: 'Đáp án đúng là "mitigation" (giảm thiểu rủi ro ngập lụt). "Migration" là di cư, "mutation" là đột biến, "moderation" là sự điều độ.'
      },
      {
        id: 'ex3',
        type: 'multiple_choice',
        targetWordId: 'v4',
        targetWord: 'cohesion',
        question: 'Organizing communal cultural festivals helps strengthen social __________ among diverse immigrant groups.',
        options: ['cohesion', 'coercion', 'collision', 'corrosion'],
        correctAnswer: 'cohesion',
        explanationVi: '"Social cohesion" là sự gắn kết xã hội. "Coercion" là sự ép buộc, "collision" là va chạm, "corrosion" là ăn mòn kim loại.'
      },
      {
        id: 'ex4',
        type: 'fill_blank',
        targetWordId: 'v3',
        targetWord: 'foster',
        question: 'Active group discussions in high schools help ________ critical thinking and communication skills in students.',
        wordBank: ['foster', 'permeable', 'reconcile', 'impediment'],
        correctAnswer: 'foster',
        explanationVi: '"Foster critical thinking" = nuôi dưỡng/thúc đẩy tư duy phản biện. Đây là collocation học thuật band 7.0+.'
      },
      {
        id: 'ex5',
        type: 'collocation_builder',
        question: 'Ghép hai nửa để tạo collocation học thuật chính xác:',
        correctAnswer: 'matched',
        collocationParts: [
          { left: 'climate change', right: 'mitigation' },
          { left: 'strengthen social', right: 'cohesion' },
          { left: 'permeable', right: 'pavement' },
          { left: 'formidable', right: 'impediment' }
        ],
        explanationVi: 'Những cụm từ này là collocations chuẩn mực trong các bài đọc học thuật của Cambridge IELTS.'
      },
      {
        id: 'ex6',
        type: 'word_formation',
        targetWordId: 'v4',
        targetWord: 'cohesion',
        rootWord: 'COHERE',
        question: 'The committee was impressed by the candidate’s clear and __________ argument throughout the presentation. (COHERE)',
        correctAnswer: 'cohesive',
        explanationVi: 'Cần một tính từ đứng trước danh từ "argument" để bổ nghĩa mang nghĩa "chặt chẽ, mạch lạc", dạng tính từ của cohere là "cohesive".'
      },
      {
        id: 'ex7',
        type: 'error_correction',
        targetWordId: 'v6',
        targetWord: 'reconcile',
        question: 'Policy makers must try to reconcile economic progress to historical building conservation. (Tìm và sửa từ sai)',
        hint: 'Chú ý giới từ đi kèm với động từ reconcile',
        correctAnswer: 'to -> with',
        explanationVi: 'Cấu trúc chuẩn xác là "reconcile A WITH B" (dung hòa A với B), không đi với giới từ "to".'
      },
      {
        id: 'ex8',
        type: 'vi_to_en',
        targetWordId: 'v5',
        targetWord: 'impediment',
        question: 'Dịch câu sau sang tiếng Anh, bắt buộc dùng danh từ "impediment": "Thiếu kinh phí là một trở ngại lớn đối với việc mở rộng công viên thành phố."',
        vietnamesePrompt: 'Thiếu kinh phí là một trở ngại lớn đối với việc mở rộng công viên thành phố.',
        correctAnswer: 'Lack of funding is a major impediment to expanding city parks.',
        explanationVi: 'Cần chú ý cụm "impediment TO doing something/expansion". Cụm này ghi điểm cao hơn "problem" rất nhiều.'
      },
      {
        id: 'ex9',
        type: 'personal_application',
        targetWordId: 'v3',
        targetWord: 'foster',
        question: 'Viết 1 câu tiếng Anh chia sẻ về trường học, sở thích hoặc trải nghiệm của bản thân có sử dụng động từ "foster". Cô Phượng Chick sẽ chấm và sửa trực tiếp cho bạn!',
        correctAnswer: 'open_ended',
        explanationVi: 'Ví dụ gợi ý: "Participating in our school sports club helped foster teamwork among my classmates."'
      }
    ],
    createdAt: '2026-09-20T08:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z'
  },
  {
    id: 'cam21-test1-listening-p2',
    title: 'Riverdale Community Garden Project',
    source: 'Cambridge IELTS 21 – Test 1',
    test: 1,
    skill: 'Listening',
    section: 'Part 2',
    level: '6.0-6.5',
    summaryVi: [
      'Bài nghe là bài giới thiệu của điều phối viên dự án (Garden Coordinator) gửi tới các tình nguyện viên mới.',
      'Mục tiêu dự án: biến đổi một bãi đất trống bị bỏ hoang cạnh bờ sông thành vườn rau sinh thái cho khu phố.',
      'Phân chia nhiệm vụ: chuẩn bị phân ủ hữu cơ (compost), lắp đặt hệ thống tưới nhỏ giọt và gieo hạt giống bản địa.',
      'Quy tắc an toàn: cất giữ dụng cụ trong nhà kho và trang bị găng tay bảo hộ.'
    ],
    topicFields: ['Community Volunteering', 'Organic Agriculture', 'Urban Ecology'],
    structureAnalysisVi: 'Người nói: Cô Sarah Green - Quản lý dự án. Người nghe: Tình nguyện viên mới. Bối cảnh: Buổi định hướng sáng thứ Bảy tại Riverdale Community Center.',
    originalText: `Welcome everyone to the Riverdale Community Garden Project! I'm thrilled to see so many enthusiastic volunteers this morning. 

Before we assign tasks, let me give you a quick overview. We recently acquired permission from the city council to revitalize this derelict plot adjacent to the canal. Our overarching objective is not merely harvesting fresh organic produce, but cultivating civic engagement and instilling environmental stewardship in our neighborhood.

Today, we will operate in three specialized syndicates. The first team will tackle soil remediation and compost preparation. Because the soil was previously compacted, we need to incorporate organic amendments to enhance aeration. The second group will assemble our gravity-fed drip irrigation network, which optimizes water conservation. Finally, the third group will sow drought-tolerant indigenous seeds. Safety is paramount: please ensure you wear heavy-duty gloves and stow all spades and rakes securely in the communal shed before leaving.`,
    vocabulary: [
      {
        id: 'v21',
        term: 'derelict',
        ipaUk: '/ˈder.ə.lɪkt/',
        ipaUs: '/ˈder.ə.lɪkt/',
        partOfSpeech: 'adjective',
        cefr: 'C1',
        priority: 'must',
        meaningVi: 'bị bỏ hoang, đổ nát, không người chăm sóc',
        definitionEn: 'in a very poor condition as a result of disuse and neglect',
        originalContext: 'We recently acquired permission from the city council to revitalize this derelict plot adjacent to the canal.',
        contextExplanationVi: 'Mảnh đất bên bờ kênh đã bị bỏ hoang, cây cỏ mọc dại và xuống cấp từ lâu.',
        collocations: ['derelict building', 'derelict land/plot', 'fall into a derelict state'],
        wordFamily: [
          { word: 'dereliction', pos: 'noun' }
        ],
        synonyms: ['abandoned', 'dilapidated', 'neglected'],
        antonyms: ['maintained', 'occupied', 'flourishing'],
        exampleEn: 'The old textile factory stood derelict for two decades before being converted into modern art galleries.',
        exampleVi: 'Nhà máy dệt cũ đã bị bỏ hoang suốt hai thập kỷ trước khi được chuyển đổi thành các phòng triển lãm nghệ thuật hiện đại.',
        commonMistakeVi: 'Hay nhầm lẫn với "decrepit" (già yếu, ọp ẹp) hoặc viết sai chính tả thành "derelicked".',
        ieltsUseVi: 'Rất phổ biến trong Listening Section 2 (bản đồ quy hoạch công trình) và Writing Task 1 bản đồ quy hoạch (Map comparison).',
        inExercise: true
      },
      {
        id: 'v22',
        term: 'stewardship',
        ipaUk: '/ˈstjuː.əd.ʃɪp/',
        ipaUs: '/ˈstuː.ɚd.ʃɪp/',
        partOfSpeech: 'noun',
        cefr: 'C1',
        priority: 'must',
        meaningVi: 'tinh thần trách nhiệm quản lý, sự trông nom và bảo tồn (môi trường, tài sản chung)',
        definitionEn: 'the careful and responsible management of something entrusted to one’s care',
        originalContext: '...cultivating civic engagement and instilling environmental stewardship in our neighborhood.',
        contextExplanationVi: 'Ý thức giữ gìn, bảo vệ môi trường và tài nguyên xanh của cư dân đối với khu phố.',
        collocations: ['environmental stewardship', 'responsible stewardship', 'stewardship of natural resources'],
        wordFamily: [
          { word: 'steward', pos: 'noun' }
        ],
        synonyms: ['custodianship', 'governance', 'caretaking'],
        antonyms: ['negligence', 'exploitation'],
        exampleEn: 'Schools should foster environmental stewardship by engaging pupils in clean-up campaigns.',
        exampleVi: 'Các trường học nên nuôi dưỡng tinh thần trách nhiệm bảo vệ môi trường bằng cách cho học sinh tham gia các chiến dịch dọn vệ sinh.',
        commonMistakeVi: 'Học sinh hay dùng từ đơn giản "care", nhưng "stewardship" mang tính vĩ mô và trách nhiệm công dân cao.',
        ieltsUseVi: 'Collocation ăn điểm C1 cho Writing Task 2 chủ đề Môi trường và Trách nhiệm cá nhân/Nhà nước.',
        inExercise: true
      },
      {
        id: 'v23',
        term: 'paramount',
        ipaUk: '/ˈpær.ə.maʊnt/',
        ipaUs: '/ˈper.ə.maʊnt/',
        partOfSpeech: 'adjective',
        cefr: 'C1',
        priority: 'must',
        meaningVi: 'tối quan trọng, quan trọng hơn bất cứ điều gì khác',
        definitionEn: 'more important than anything else; supreme',
        originalContext: 'Safety is paramount: please ensure you wear heavy-duty gloves...',
        contextExplanationVi: 'An toàn lao động của các tình nguyện viên là ưu tiên số một, trên hết mọi việc khác.',
        collocations: ['of paramount importance', 'paramount concern', 'safety is paramount'],
        wordFamily: [],
        synonyms: ['supreme', 'foremost', 'preeminent', 'vital'],
        antonyms: ['trivial', 'minor', 'negligible'],
        exampleEn: 'Ensuring clean water supplies is of paramount importance in flood-affected regions of Central Vietnam.',
        exampleVi: 'Việc đảm bảo nguồn nước sạch là điều tối quan trọng tại các vùng chịu ảnh hưởng lũ lụt ở miền Trung Việt Nam.',
        commonMistakeVi: 'Cụm thành ngữ chuẩn là "of paramount importance", không dùng "with paramount importance".',
        ieltsUseVi: 'Thay thế cực tốt cho "very important" trong IELTS Speaking Part 3 và Writing Task 2.',
        inExercise: true
      }
    ],
    patterns: [
      {
        id: 'p21',
        type: 'pattern',
        formula: 'instill [quality/value] in [someone]',
        meaningVi: 'truyền dạy, thấm nhuần một phẩm chất hay giá trị cho ai đó',
        usageVi: 'Rất hay dùng trong chủ đề Giáo dục (Education) và Gia đình (Parenting).',
        originalExample: '...instilling environmental stewardship in our neighborhood.',
        newExample: 'Parents strive to instill moral values and empathy in their children from an early age.',
        mistakeVi: 'Giới từ đi kèm là "in" hoặc "into", không dùng "for".',
        inFlashcards: true
      }
    ],
    exercises: [
      {
        id: 'ex21',
        type: 'multiple_choice',
        targetWordId: 'v23',
        targetWord: 'paramount',
        question: 'When organizing international student excursions, safety precautions must be considered of __________ importance.',
        options: ['paramount', 'prominent', 'pervasive', 'provisional'],
        correctAnswer: 'paramount',
        explanationVi: 'Cụm chuẩn "of paramount importance" = tối quan trọng. "Pervasive" là lan tỏa khắp nơi, "provisional" là tạm thời.'
      },
      {
        id: 'ex22',
        type: 'fill_blank',
        targetWordId: 'v21',
        targetWord: 'derelict',
        question: 'The local community banded together to turn a __________ warehouse into a vibrant youth center.',
        wordBank: ['derelict', 'paramount', 'stewardship'],
        correctAnswer: 'derelict',
        explanationVi: '"Derelict warehouse" = nhà kho bị bỏ hoang, xuống cấp.'
      }
    ],
    createdAt: '2026-09-20T09:00:00.000Z',
    updatedAt: '2026-09-20T09:00:00.000Z'
  }
];

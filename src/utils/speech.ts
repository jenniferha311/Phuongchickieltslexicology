export function playPronunciation(text: string, accent: 'uk' | 'us' = 'uk') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    return;
  }

  // Cancel existing utterances
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  const targetLang = accent === 'uk' ? 'en-GB' : 'en-US';
  utterance.lang = targetLang;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const matchedVoice = voices.find(
      (v) => v.lang.replace('_', '-').toLowerCase() === targetLang.toLowerCase()
    ) || voices.find((v) => v.lang.toLowerCase().startsWith('en'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

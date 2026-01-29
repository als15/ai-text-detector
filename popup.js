document.addEventListener('DOMContentLoaded', async () => {
  const noSelection = document.getElementById('no-selection');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const error = document.getElementById('error');

  const scoreValue = document.getElementById('score-value');
  const verdict = document.getElementById('verdict');
  const charCount = document.getElementById('char-count');
  const wordCount = document.getElementById('word-count');
  const errorMessage = document.getElementById('error-message');

  // Check for stored analysis result
  const stored = await chrome.storage.local.get(['lastAnalysis', 'analysisError']);

  if (stored.analysisError) {
    showError(stored.analysisError);
    await chrome.storage.local.remove(['analysisError']);
  } else if (stored.lastAnalysis) {
    showResult(stored.lastAnalysis);
  }

  // Listen for analysis updates
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.lastAnalysis) {
        showResult(changes.lastAnalysis.newValue);
      }
      if (changes.analysisError) {
        showError(changes.analysisError.newValue);
      }
    }
  });

  function showResult(data) {
    hideAll();
    result.classList.remove('hidden');

    const score = Math.round(data.aiScore * 100);
    scoreValue.textContent = score;

    // Update score circle color based on score
    const scoreCircle = document.querySelector('.score-circle');
    if (score >= 70) {
      scoreCircle.style.borderColor = '#ff5252';
      verdict.className = 'verdict ai';
      verdict.textContent = 'Likely AI-Generated';
    } else if (score >= 40) {
      scoreCircle.style.borderColor = '#ffc107';
      verdict.className = 'verdict mixed';
      verdict.textContent = 'Mixed / Uncertain';
    } else {
      scoreCircle.style.borderColor = '#4caf50';
      verdict.className = 'verdict human';
      verdict.textContent = 'Likely Human-Written';
    }

    charCount.textContent = data.charCount || 0;
    wordCount.textContent = data.wordCount || 0;
  }

  function showError(message) {
    hideAll();
    error.classList.remove('hidden');
    errorMessage.textContent = message;
  }

  function hideAll() {
    noSelection.classList.add('hidden');
    loading.classList.add('hidden');
    result.classList.add('hidden');
    error.classList.add('hidden');
  }

  // Button handlers
  document.getElementById('analyze-again').addEventListener('click', async () => {
    await chrome.storage.local.remove(['lastAnalysis']);
    hideAll();
    noSelection.classList.remove('hidden');
  });

  document.getElementById('open-options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('settings-link').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});

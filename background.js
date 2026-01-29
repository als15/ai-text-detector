// Background service worker for AI Text Detector

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyze-text',
    title: 'Analyze with AI Detector',
    contexts: ['selection']
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'analyze-text') {
    const selectedText = info.selectionText;

    if (!selectedText || selectedText.trim().length < 50) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        message: 'Please select at least 50 characters for accurate analysis.'
      });
      return;
    }

    // Show loading state
    chrome.tabs.sendMessage(tab.id, { action: 'showLoading' });

    try {
      const result = await analyzeText(selectedText);

      // Store result for popup
      await chrome.storage.local.set({ lastAnalysis: result });

      // Show tooltip on page
      chrome.tabs.sendMessage(tab.id, {
        action: 'showTooltip',
        data: result
      });
    } catch (error) {
      const errorMessage = error.message || 'Analysis failed. Please try again.';

      await chrome.storage.local.set({ analysisError: errorMessage });

      chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        message: errorMessage
      });
    }
  }
});

// Analyze text using configured API
async function analyzeText(text) {
  const settings = await chrome.storage.sync.get(['apiKey', 'apiProvider']);
  const apiKey = settings.apiKey;
  const provider = settings.apiProvider || 'gptzero';

  if (!apiKey) {
    throw new Error('API key not configured. Please set your API key in the extension settings.');
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;

  let aiScore;

  switch (provider) {
    case 'gptzero':
      aiScore = await analyzeWithGPTZero(text, apiKey);
      break;
    case 'originality':
      aiScore = await analyzeWithOriginality(text, apiKey);
      break;
    case 'sapling':
      aiScore = await analyzeWithSapling(text, apiKey);
      break;
    case 'copyleaks':
      aiScore = await analyzeWithCopyleaks(text, apiKey);
      break;
    case 'zerogpt':
      aiScore = await analyzeWithZeroGPT(text, apiKey);
      break;
    case 'writer':
      aiScore = await analyzeWithWriter(text, apiKey);
      break;
    case 'contentatscale':
      aiScore = await analyzeWithContentAtScale(text, apiKey);
      break;
    default:
      throw new Error('Unknown API provider');
  }

  return {
    aiScore,
    wordCount,
    charCount,
    timestamp: Date.now()
  };
}

// GPTZero API integration
async function analyzeWithGPTZero(text, apiKey) {
  const response = await fetch('https://api.gptzero.me/v2/predict/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      document: text
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your GPTZero API key.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  // GPTZero returns completely_generated_prob as the AI probability
  return data.documents?.[0]?.completely_generated_prob ?? data.completely_generated_prob ?? 0;
}

// Originality.ai API integration
async function analyzeWithOriginality(text, apiKey) {
  const response = await fetch('https://api.originality.ai/api/v1/scan/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-OAI-API-KEY': apiKey
    },
    body: JSON.stringify({
      content: text
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your Originality.ai API key.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.score?.ai ?? 0;
}

// Sapling AI Detector API integration
async function analyzeWithSapling(text, apiKey) {
  const response = await fetch('https://api.sapling.ai/api/v1/aidetect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      key: apiKey,
      text: text
    })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key. Please check your Sapling API key.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.score ?? 0;
}

// Copyleaks AI Content Detector API integration
async function analyzeWithCopyleaks(text, apiKey) {
  const response = await fetch('https://api.copyleaks.com/v2/writer-detector/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      text: text
    })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key. Please check your Copyleaks API key.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  // Copyleaks returns summary.ai as the AI probability (0-1)
  return data.summary?.ai ?? data.results?.ai ?? 0;
}

// ZeroGPT API integration
async function analyzeWithZeroGPT(text, apiKey) {
  const response = await fetch('https://api.zerogpt.com/api/detect/detectText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ApiKey': apiKey
    },
    body: JSON.stringify({
      input_text: text
    })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key. Please check your ZeroGPT API key.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  // ZeroGPT returns fakePercentage as AI probability (0-100), normalize to 0-1
  const fakePercent = data.data?.fakePercentage ?? data.fakePercentage ?? 0;
  return fakePercent / 100;
}

// Writer.com AI Content Detector API integration
async function analyzeWithWriter(text, apiKey) {
  const response = await fetch('https://enterprise-api.writer.com/content/organization/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      input: text
    })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key. Please check your Writer.com API key.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  // Writer returns score as AI probability (0-100), normalize to 0-1
  const score = data.score ?? data.aiScore ?? 0;
  return score > 1 ? score / 100 : score;
}

// Content at Scale AI Detector API integration
async function analyzeWithContentAtScale(text, apiKey) {
  const response = await fetch('https://api.contentatscale.ai/v1/detect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      content: text
    })
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key. Please check your Content at Scale API key.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  // Content at Scale returns probability as 0-100 or 0-1
  const prob = data.probability ?? data.ai_probability ?? data.score ?? 0;
  return prob > 1 ? prob / 100 : prob;
}

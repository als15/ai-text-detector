document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settings-form');
  const apiProvider = document.getElementById('api-provider');
  const apiKey = document.getElementById('api-key');
  const toggleBtn = document.getElementById('toggle-visibility');
  const testBtn = document.getElementById('test-btn');
  const status = document.getElementById('status');
  const providerHelp = document.getElementById('provider-help');

  const providerLinks = {
    gptzero: 'https://gptzero.me/api',
    originality: 'https://originality.ai/api',
    sapling: 'https://sapling.ai/api',
    copyleaks: 'https://copyleaks.com/ai-content-detector',
    zerogpt: 'https://zerogpt.com/api',
    writer: 'https://writer.com/api',
    contentatscale: 'https://contentatscale.ai/ai-content-detector'
  };

  // Load saved settings
  const settings = await chrome.storage.sync.get(['apiKey', 'apiProvider']);
  if (settings.apiKey) {
    apiKey.value = settings.apiKey;
  }
  if (settings.apiProvider) {
    apiProvider.value = settings.apiProvider;
    updateProviderHelp();
  }

  // Update help text when provider changes
  apiProvider.addEventListener('change', updateProviderHelp);

  function updateProviderHelp() {
    const provider = apiProvider.value;
    const link = providerLinks[provider];
    providerHelp.innerHTML = `Get your API key from <a href="${link}" target="_blank">${link.replace('https://', '')}</a>`;
  }

  // Toggle password visibility
  toggleBtn.addEventListener('click', () => {
    if (apiKey.type === 'password') {
      apiKey.type = 'text';
      toggleBtn.textContent = 'Hide';
    } else {
      apiKey.type = 'password';
      toggleBtn.textContent = 'Show';
    }
  });

  // Save settings
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const key = apiKey.value.trim();
    const provider = apiProvider.value;

    if (!key) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    await chrome.storage.sync.set({
      apiKey: key,
      apiProvider: provider
    });

    showStatus('Settings saved successfully!', 'success');
  });

  // Test connection
  testBtn.addEventListener('click', async () => {
    const key = apiKey.value.trim();
    const provider = apiProvider.value;

    if (!key) {
      showStatus('Please enter an API key first', 'error');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

    try {
      const testText = 'This is a test sentence to verify the API connection is working correctly. The quick brown fox jumps over the lazy dog. Testing API connectivity for the AI detection service.';

      let response;
      switch (provider) {
        case 'gptzero':
          response = await fetch('https://api.gptzero.me/v2/predict/text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': key
            },
            body: JSON.stringify({ document: testText })
          });
          break;

        case 'originality':
          response = await fetch('https://api.originality.ai/api/v1/scan/ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-OAI-API-KEY': key
            },
            body: JSON.stringify({ content: testText })
          });
          break;

        case 'sapling':
          response = await fetch('https://api.sapling.ai/api/v1/aidetect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ key: key, text: testText })
          });
          break;

        case 'copyleaks':
          response = await fetch('https://api.copyleaks.com/v2/writer-detector/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({ text: testText })
          });
          break;

        case 'zerogpt':
          response = await fetch('https://api.zerogpt.com/api/detect/detectText', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ApiKey': key
            },
            body: JSON.stringify({ input_text: testText })
          });
          break;

        case 'writer':
          response = await fetch('https://enterprise-api.writer.com/content/organization/detect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({ input: testText })
          });
          break;

        case 'contentatscale':
          response = await fetch('https://api.contentatscale.ai/v1/detect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': key
            },
            body: JSON.stringify({ content: testText })
          });
          break;
      }

      if (response.ok) {
        showStatus('Connection successful! Your API key is valid.', 'success');
      } else if (response.status === 401 || response.status === 403) {
        showStatus('Invalid API key. Please check and try again.', 'error');
      } else {
        showStatus(`API error: ${response.status}. Please try again.`, 'error');
      }
    } catch (error) {
      showStatus('Connection failed. Please check your internet connection.', 'error');
    }

    testBtn.disabled = false;
    testBtn.textContent = 'Test Connection';
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');

    setTimeout(() => {
      status.classList.add('hidden');
    }, 5000);
  }
});

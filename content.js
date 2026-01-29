// Content script for AI Text Detector
(function() {
  let tooltip = null;

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedText') {
      const selectedText = window.getSelection().toString().trim();
      sendResponse({ text: selectedText });
    } else if (request.action === 'showTooltip') {
      showAnalysisTooltip(request.data);
    } else if (request.action === 'showLoading') {
      showLoadingTooltip();
    } else if (request.action === 'showError') {
      showErrorTooltip(request.message);
    }
    return true;
  });

  function createTooltipBase() {
    removeTooltip();

    tooltip = document.createElement('div');
    tooltip.id = 'ai-detector-tooltip';

    // Position near selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      tooltip.style.position = 'fixed';
      tooltip.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`;
      tooltip.style.top = `${rect.bottom + 10}px`;
      tooltip.style.zIndex = '2147483647';
    }

    document.body.appendChild(tooltip);
    return tooltip;
  }

  function showLoadingTooltip() {
    const tip = createTooltipBase();
    tip.innerHTML = `
      <div class="ai-detector-content">
        <div class="ai-detector-spinner"></div>
        <p>Analyzing text...</p>
      </div>
    `;
  }

  function showAnalysisTooltip(data) {
    const tip = createTooltipBase();
    const score = Math.round(data.aiScore * 100);

    let verdictClass, verdictText;
    if (score >= 70) {
      verdictClass = 'ai';
      verdictText = 'Likely AI-Generated';
    } else if (score >= 40) {
      verdictClass = 'mixed';
      verdictText = 'Mixed / Uncertain';
    } else {
      verdictClass = 'human';
      verdictText = 'Likely Human-Written';
    }

    tip.innerHTML = `
      <div class="ai-detector-content">
        <div class="ai-detector-header">
          <span class="ai-detector-title">AI Detection Result</span>
          <button class="ai-detector-close">&times;</button>
        </div>
        <div class="ai-detector-score ${verdictClass}">
          <span class="score-number">${score}%</span>
          <span class="score-label">AI Probability</span>
        </div>
        <div class="ai-detector-verdict ${verdictClass}">${verdictText}</div>
        <div class="ai-detector-stats">
          <span>${data.wordCount} words analyzed</span>
        </div>
      </div>
    `;

    // Add close button handler
    tip.querySelector('.ai-detector-close').addEventListener('click', removeTooltip);

    // Auto-remove after 10 seconds
    setTimeout(removeTooltip, 10000);
  }

  function showErrorTooltip(message) {
    const tip = createTooltipBase();
    tip.innerHTML = `
      <div class="ai-detector-content">
        <div class="ai-detector-header">
          <span class="ai-detector-title">Error</span>
          <button class="ai-detector-close">&times;</button>
        </div>
        <p class="ai-detector-error">${message}</p>
      </div>
    `;

    tip.querySelector('.ai-detector-close').addEventListener('click', removeTooltip);
  }

  function removeTooltip() {
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
      tooltip = null;
    }
  }

  // Remove tooltip when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (tooltip && !tooltip.contains(e.target)) {
      removeTooltip();
    }
  });
})();

# AI Text Detector

A Chrome extension that analyzes selected text on any webpage to determine whether it was written by AI or a human. Get instant probability scores and verdicts powered by industry-leading AI detection APIs.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=google-chrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Instant Analysis**: Right-click any selected text to analyze it for AI-generated content
- **Multiple API Providers**: Choose from 7 different AI detection services
- **Visual Scoring**: Color-coded results (red/yellow/green) with percentage scores
- **Inline Tooltips**: See results directly on the page without leaving context
- **Detailed Popup**: View comprehensive analysis including word count and timestamp
- **Easy Configuration**: Simple settings page for API key management
- **Connection Testing**: Verify your API credentials before use

## Supported API Providers

| Provider | Website | Free Tier |
|----------|---------|-----------|
| GPTZero | [gptzero.me](https://gptzero.me) | Yes |
| Originality.ai | [originality.ai](https://originality.ai) | Limited |
| Sapling AI | [sapling.ai](https://sapling.ai) | Yes |
| Copyleaks | [copyleaks.com](https://copyleaks.com) | Trial |
| ZeroGPT | [zerogpt.com](https://zerogpt.com) | Yes |
| Writer.com | [writer.com](https://writer.com) | Yes |
| Content at Scale | [contentatscale.ai](https://contentatscale.ai) | Limited |

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/ai-text-detector.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the cloned folder

5. The extension icon will appear in your toolbar

### Configuration

1. Click the extension icon and select **Configure API Key**
2. Choose your preferred API provider from the dropdown
3. Enter your API key (obtain from provider's website)
4. Click **Test Connection** to verify credentials
5. Click **Save Settings**

## Usage

1. Select any text on a webpage (minimum 50 characters)
2. Right-click and choose **"Analyze with AI Detector"**
3. View results in:
   - **Inline tooltip**: Appears near selected text
   - **Extension popup**: Click extension icon for details

### Understanding Results

| Score | Verdict | Meaning |
|-------|---------|---------|
| 70-100% | Likely AI-Generated | High probability of AI authorship |
| 40-69% | Mixed/Uncertain | Unclear origin, may be partially AI |
| 0-39% | Likely Human-Written | Low probability of AI authorship |

## Project Structure

```
ai-text-detector/
├── manifest.json       # Extension configuration
├── background.js       # Service worker with API integrations
├── content.js          # Content script for page interactions
├── content.css         # Tooltip styling
├── popup.html/js/css   # Extension popup interface
├── options.html/js/css # Settings page
└── icons/              # Extension icons (16, 32, 48, 128px)
```

## Tech Stack

- **JavaScript** (ES6+) - No build step required
- **Chrome Extension Manifest V3** - Latest extension standard
- **Chrome APIs**: Storage, Context Menus, Runtime, Tabs
- **Pure CSS3** - No frameworks, minimal footprint

## Privacy

- API keys are stored locally in Chrome's encrypted storage
- Text is sent only to your selected API provider for analysis
- No data is collected or stored by this extension
- No analytics or tracking

## Development

This extension requires no build process. Simply edit the files and reload the extension in Chrome.

```bash
# Make changes to files
# Go to chrome://extensions/
# Click the refresh icon on the extension card
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

AI detection is not 100% accurate. Results should be used as one factor among many when evaluating text origin. False positives and negatives can occur. Always use human judgment in conjunction with automated tools.

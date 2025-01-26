# commit-o-clock README

commit-o-clock is a VS Code extension that tracks all code changes in your workspace over a defined interval (default: 30 minutes) and automatically commits those changes with AI-generated commit messages using Gemini AI. It helps developers keep a seamless version history without the hassle of manual Git operations.

---

## Features

- **Automatic Change Tracking**: Detects file changes, additions, and deletions in real time.
- **AI-Generated Commit Messages**: Uses Gemini AI to generate concise and relevant commit messages summarizing the work done in the interval.
- **Customizable Time Intervals**: Automatically commits changes every 30 minutes (default), which can be adjusted in the code.
- **Seamless Integration**: Maintains a separate `commit-o-clock` folder in your workspace for tracking changes, leaving your main project untouched.
- **Works with Any Workspace**: Compatible with all VS Code projects.

---

## Requirements

Before using this extension, ensure the following tools are installed on your system:

1. **Node.js**: [Download and Install](https://nodejs.org/)
2. **Git**: [Download and Install](https://git-scm.com/)
3. **Gemini AI API Key**: Create an account and obtain your API key from [Gemini AI](https://gemini-ai.com/).
4. **VS Code**: [Download and Install](https://code.visualstudio.com/)

---

## Installation

### Installing from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/JashAgrawal/commit-o-clock.git
   cd commit-o-clock
   ```

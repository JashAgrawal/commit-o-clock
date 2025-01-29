# Commit-o-Clock 

A powerful VS Code extension that automates your Git commits using AI. Never worry about writing commit messages again!

## Features 

### 1. AI-Powered Commits
- **Smart Commit Messages**: Automatically generates meaningful commit messages based on your code changes
- **Context-Aware**: Takes into account your previous commit messages for better continuity
- **Intelligent Diffs Analysis**: Analyzes file changes to create detailed and relevant commit messages

### 2. Automated Commit Scheduling
- **Auto-Commit Mode**: Automatically commits your changes at regular intervals
- **Configurable Intervals**: Set custom time intervals for automatic commits (default: 30 minutes)
- **Daily Scheduled Commits**: Schedule commits to run at a specific time each day

### 3. Easy Controls
- **Quick Toggle**: Easily enable/disable auto-commit functionality
- **Keyboard Shortcut**: Trigger AI commits manually using `Ctrl+Shift+C` (Windows/Linux) or `Cmd+Shift+C` (Mac)
- **Status Indicators**: Clear visibility of auto-commit status in VS Code

## Installation 

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Commit-o-Clock"
4. Click Install
5. Enter your invite code in settings (Beta testing phase)

## Configuration 

Access settings through VS Code's settings panel:

1. **Auto-Commit Interval**
   ```json
   "gitAutoCommit.interval": 30  // Time in minutes between auto-commits
   ```

2. **Scheduled Commit Time**
   ```json
   "gitAutoCommit.scheduledTime": "14:30"  // 24-hour format (e.g., "14:30" for 2:30 PM)
   ```

3. **Auto-Commit Toggle**
   ```json
   "gitAutoCommit.autoCommitEnabled": true  // Enable/disable auto-commits
   ```

4. **Invite Code** (Beta)
   ```json
   "gitAutoCommit.inviteCode": "INVITECODEHERE"  // Your beta testing invite code
   ```

## Commands 

- `AI Commit`: Manually trigger an AI-powered commit
- `Toggle Auto-Commit`: Enable/disable automatic commits
- `Schedule Daily Commit`: Set up a daily commit schedule

## Requirements 

- Git installed and configured in your workspace
- Active internet connection for AI functionality
- Valid invite code (during beta testing phase)

## Usage Tips 

1. **First Time Setup**:
   - Install the extension
   - Enter your invite code in settings
   - Initialize Git in your workspace (if not already done)

2. **Daily Workflow**:
   - Enable auto-commit mode for continuous backup
   - Or set a scheduled time for daily commits
   - Use manual AI commits for important changes

3. **Best Practices**:
   - Review auto-generated commit messages
   - Adjust commit intervals based on your workflow
   - Use scheduled commits for end-of-day summaries

## Support 

For issues, suggestions, or feedback:
- File an issue on our [GitHub repository]
- Contact us through VS Code marketplace

## License 

[MIT License](LICENSE)

---

Made with  by Jash Agrawal

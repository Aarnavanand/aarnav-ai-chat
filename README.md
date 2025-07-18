# CommandPal - AI Terminal Command Generator

CommandPal is a powerful web application that converts natural language instructions into precise terminal commands using Google's Gemini 1.5 Pro API.

## Features

- 🤖 **AI-Powered**: Uses Google Gemini 1.5 Pro for accurate command generation
- 🔍 **Natural Language Input**: Type what you want to do in plain English
- 📋 **Smart Output**: Get properly formatted terminal commands with syntax highlighting
- 🕘 **Command History**: Stores your last 5 queries locally
- 🌙 **Dark/Light Mode**: Toggle between themes with system preference detection
- 📜 **Command Explanation**: Optional feature to explain what commands do
- 🏷️ **Command Types**: Automatically detects and categorizes Shell, Git, and Python commands
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS, ShadCN UI
- **Backend**: Next.js API routes
- **AI**: Google Gemini 1.5 Pro API
- **State Management**: React hooks with localStorage
- **Styling**: Tailwind CSS with custom gradients and animations

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your-actual-api-key-here
     ```

4. Get your Gemini API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env.local` file

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Enter Instructions**: Type what you want to do in natural language
   - Example: "Create a new Git branch called feature-login"
   - Example: "List all Python files in the current directory"

2. **Generate Command**: Click "Generate Command" or press Ctrl+Enter

3. **Copy & Use**: Copy the generated command to your clipboard

4. **Explain Commands**: Click "Explain" to understand what the command does

5. **Browse History**: Access your recent commands in the sidebar

## Example Queries

- "Create a new directory called projects"
- "Install the requests library for Python"
- "Find all files larger than 100MB"
- "Commit all changes with message 'Add new feature'"
- "Create a virtual environment for Python"
- "Change file permissions to read-write-execute for owner"

## Command Types

CommandPal automatically detects and categorizes:
- 🟢 **Shell**: General terminal commands (ls, mkdir, chmod, etc.)
- 🟠 **Git**: Version control commands (git add, commit, push, etc.)
- 🔵 **Python**: Python-related commands (pip, python, virtualenv, etc.)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `GEMINI_API_KEY` in the Vercel dashboard under Environment Variables
4. Deploy automatically

### Other Platforms

The app is built with Next.js and can be deployed on any platform that supports Node.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**© 2024 Aarnav Anand. All rights reserved.**
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const EXPLANATION_PROMPT = `You are a terminal command explainer. Explain what the given command does in simple, clear language.

Rules:
1. Provide a concise but complete explanation
2. Explain each part of the command if it has multiple components
3. Mention any important flags or options
4. Use simple language that beginners can understand
5. Keep explanations under 100 words
6. Focus on what the command actually does

Examples:
Command: git checkout -b feature-login
Explanation: Creates a new Git branch called "feature-login" and switches to it. The "-b" flag tells Git to create a new branch before switching.

Command: ls -la
Explanation: Lists all files and directories in the current location. The "-l" flag shows detailed information (permissions, size, date), and "-a" includes hidden files that start with a dot.

Command: pip install requests
Explanation: Installs the "requests" Python library, which is commonly used for making HTTP requests. This downloads and installs the package so you can use it in your Python projects.

Now explain this command:
`;

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key not found');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { command } = body;

    if (!command || typeof command !== 'string') {
      console.error('Invalid command:', command);
      return NextResponse.json(
        { error: 'Invalid command provided' },
        { status: 400 }
      );
    }

    if (command.trim().length === 0) {
      return NextResponse.json(
        { error: 'Command cannot be empty' },
        { status: 400 }
      );
    }
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: EXPLANATION_PROMPT + command
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, response.statusText, errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid API response structure:', data);
      return NextResponse.json(
        { error: 'No explanation generated' },
        { status: 500 }
      );
    }

    const explanation = data.candidates[0].content.parts[0].text.trim();

    if (!explanation) {
      return NextResponse.json(
        { error: 'Empty explanation generated' },
        { status: 500 }
      );
    }
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error explaining command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
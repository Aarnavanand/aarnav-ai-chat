import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const COMMAND_PROMPT = `You are CommandPal, an AI assistant that converts natural language into valid shell, Git, or Python commands.

Your job is to:
- Convert user instructions into one or more terminal commands.
- Respond with the correct command only — no explanations, no greetings.
- If multiple steps are needed, combine them using \`&&\`.

Supported categories: Shell (Linux/macOS), Git, Python one-liners.

Examples:

User: Create a new Git branch called "auth-flow"  
Command: git checkout -b auth-flow

User: Show all hidden files in current directory  
Command: ls -la

User: Sort a list of numbers in Python  
Command: sorted([9, 3, 1, 7])

Now convert the following instruction into a command.
Only return the command and nothing else.

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
    const { query } = body;

    if (!query || typeof query !== 'string') {
      console.error('Invalid query:', query);
      return NextResponse.json(
        { error: 'Invalid query provided' },
        { status: 400 }
      );
    }

    if (query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
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
                text: COMMAND_PROMPT + query
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 200,
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
        { error: 'No command generated' },
        { status: 500 }
      );
    }

    const command = data.candidates[0].content.parts[0].text.trim();

    if (!command) {
      return NextResponse.json(
        { error: 'Empty command generated' },
        { status: 500 }
      );
    }
    return NextResponse.json({ command });
  } catch (error) {
    console.error('Error generating command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
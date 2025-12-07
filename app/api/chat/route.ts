import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract configuration passed from client headers/body
    const targetUrl = req.headers.get('x-target-url');
    const apiKey = req.headers.get('Authorization');

    if (!targetUrl) {
      return new NextResponse(JSON.stringify({ error: 'Missing x-target-url header' }), { status: 400 });
    }
    
    // Forward the request to the actual LLM provider
    const response = await fetch(`${targetUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey || '',
        // Some providers need these
        'HTTP-Referer': 'https://auto-translate-board.vercel.app', 
        'X-Title': 'Auto Translate Board',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return new NextResponse(errorText, { status: response.status, statusText: response.statusText });
    }

    // Stream the response back to the client
    return new NextResponse(response.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

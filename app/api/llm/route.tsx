import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

const googleAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiConfig = {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-03-25",
    ...geminiConfig,
});

interface GenerateResponse {
    response: {
        text: () => string;
    };
}

// Next.js App Router API handler
export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();
        const { transcript } = body;
        
        // Use the transcript in the prompt if provided
        const prompt = `
        You are a dental assistant AI.
        
        Given the following transcript of a dentist speaking during a procedure, return a structured summary of tooth statuses in this exact JSON format:
        
        {
          "teeth": [
            { "number": 26, "status": "issue" },
            { "number": 14, "status": "treated" },
            { "number": 47, "status": "issue" }
          ],
          "summary_dentist": "Tooth 26 has occlusal caries. Composite placed on the buccal surface of tooth 14. Tooth 47 was extracted.",
          "summary_patient": "We found a small cavity on one of your back teeth, there is a filling on another, and one tooth was previously removed."
        }
        
        Status values must be one of:
        - "healthy" (default, omit if not mentioned)
        - "issue" (for cavity, extraction, concern)
        - "treated" (for fillings, crowns, etc.)
        
        You must respond with ONLY the JSON object and absolutely nothing else. No markdown, no backticks, no code blocks.
        
        Now process this transcript:
        "${transcript}"
        `;
        
        
        const result: GenerateResponse = await geminiModel.generateContent(prompt);
        let responseText = result.response.text();
        
        // Clean up the response by removing markdown code blocks
        responseText = responseText.replace(/```json\n|\n```|`/g, '');
        
        // Try to parse and validate the JSON
        try {
            const parsedJson = JSON.parse(responseText);
            responseText = JSON.stringify(parsedJson);
        } catch (jsonError) {
            console.error("Error parsing JSON from LLM:", jsonError);
            // If we can't parse it, just use the cleaned text
        }
        
        // Return successful response
        return NextResponse.json({ 
            success: true, 
            response: responseText 
        });
    } catch (error: unknown) {
        console.error("LLM API error:", error);
        
        // Return error response
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, { status: 500 });
    }
}

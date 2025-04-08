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
        Return a JSON object with:
        - teeth: array of affected teeth, each with:
        - number (int)
        - procedure (e.g., "filling", "extraction", "cavity")
        - surface (optional)
        - teeth numbers start from 1 to 32 top to bottom, right to left
        - for instance if said remove all bottom teeth, teeth 17 to 32 will be given extraction

        Also return a short summary for the dentist and the patient.

        Output format:

        {
        "teeth": [
            { "number": 26, "procedure": "filling", "surface": "occlusal" },
            { "number": 47, "procedure": "extraction" }
        ],
        "summary_dentist": "Filling on 26, extraction on 47.",
        "summary_patient": "We fixed one tooth and removed another."
        }

        Transcript:
        "{transcriptText}"
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

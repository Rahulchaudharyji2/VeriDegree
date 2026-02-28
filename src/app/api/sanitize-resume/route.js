import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing in environment variables");
        return NextResponse.json({ error: "Gemini API Key is not configured in .env.local" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    // Using gemini-flash-latest as per available models for this specific API key
    const model = genAI.getGenerativeModel({ 
        model: "gemini-flash-latest"
    });

    const systemPrompt = `
      Act as a strict, unbiased HR parser for a feature called 'BlindHire'. 
      Your goal is to remove ALL human bias from a resume by stripping Personally Identifiable Information (PII).
      
      CRITICAL RULES:
      - REMOVE: Names, Email, Phone, Social Media Links, Gender, Specific Locations (City/Country), and exact birth dates.
      - ANONYMIZE: Replace specific University names with "Tier-1 University" or "University", and specific Company names with "Tech Company", "Startup", or "Enterprise".
      - EXTRACT: Core Technical Skills, Years of Experience, Project Descriptions, and technical metrics/achievements.
      
      OUTPUT FORMAT:
      You MUST return strictly a JSON object with this exact structure:
      {
        "title": "Anonymous [Generic Job Title]",
        "skills": ["Skill1", "Skill2", ...],
        "experience": "Description of total years and seniority level",
        "projects": [
          {
            "name": "Project Title",
            "description": "Sanitized technical description of the project and impact"
          }
        ]
      }
    `;

    const result = await model.generateContent([
        systemPrompt,
        `RESUME TEXT TO SANITIZE:\n${resumeText}\n\nIMPORTANT: Return ONLY the JSON object.`
    ]);

    const response = await result.response;
    const text = response.text();
    
    try {
        const jsonResponse = JSON.parse(text);
        return NextResponse.json(jsonResponse);
    } catch (parseError) {
        console.error("JSON Parse Error. Raw Text:", text);
        // Fallback: If it's not valid JSON, try to extract JSON from markdown block if present
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
        if (jsonMatch) {
            try {
                const salvagedJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                return NextResponse.json(salvagedJson);
            } catch (e) {
                return NextResponse.json({ error: "Failed to salvage JSON from AI response" }, { status: 500 });
            }
        }
        return NextResponse.json({ error: "AI response was not valid JSON" }, { status: 500 });
    }

  } catch (error) {
    console.error("Gemini API Error details:", error);
    return NextResponse.json({ 
        error: error.message || "Internal Server Error",
        details: error.stack
    }, { status: 500 });
  }
}

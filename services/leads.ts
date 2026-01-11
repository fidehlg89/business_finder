import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

/**
 * Server Action: findLeads(category, location)
 * Uses Gemini 2.5 Flash with Google Maps Grounding to find real businesses.
 */
export async function findLeadsAction(category: string, location: string): Promise<Lead[]> {
  // Check for API key availability (env variable is pre-configured in this environment)
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    return [];
  }

  console.log(`Searching for ${category} in ${location} using Gemini Discovery Engine...`);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We explicitly ask for a JSON array in the text prompt because 
    // responseSchema is not supported when using the googleMaps tool.
    const prompt = `
      Act as a specific Lead Discovery Agent for a Web Development & Automation Agency. 
      Your goal is to find potential clients who need a website and RECOMMEND a specific digital automation for them.

      Task:
      Find at least 20 operational '${category}' businesses in '${location}'.
      
      CRITICAL CRITERIA FOR SELECTION:
      1. STRICTLY prioritize businesses that DO NOT have a website listed.
      2. If a business uses a Facebook, Instagram, or other social media URL as their "website", treat this as "No Professional Website" and set the "website" field to null.
      3. Exclude large international franchises. Focus on local, independent businesses.

      For each business:
      1. Analyze its name and category to determine the best digital automation to sell them (e.g., Booking System, Order Automation, Inventory Sync).
      2. WRITE A SHORT COLD EMAIL (max 80 words) pitching this specific automation.
      
      Return a RAW JSON array (do not use Markdown code blocks) of objects with this exact schema:
      {
        "name": string,
        "address": string,
        "rating": number,
        "user_ratings_total": number,
        "business_status": "OPERATIONAL",
        "website": string | null, 
        "types": string[],
        "suggested_solution": string, // e.g. "Automated Reservation System"
        "suggestion_reason": string,   // A short sentence explaining WHY.
        "email_draft_subject": string, // e.g. "Question about [Business Name] reservations"
        "email_draft_body": string     // The email text. Professional, casual, offering to build the automation.
      }
      
      IMPORTANT: If a website is not found, unknown, or is a social media link, explicitly set "website" to null.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        // Note: responseSchema/responseMimeType are not supported with googleMaps tool
      }
    });

    const rawText = response.text || "[]";
    
    // Sanitize the output (Gemini sometimes wraps JSON in markdown)
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData: any[] = [];
    try {
        parsedData = JSON.parse(cleanJson);
    } catch (e) {
        console.error("Failed to parse business data:", e);
        console.debug("Raw output:", rawText);
        return [];
    }

    if (!Array.isArray(parsedData)) return [];

    // Map the grounded data to our Lead application type
    const leads: Lead[] = parsedData.map((item, idx) => ({
      id: `live_${Date.now()}_${idx}`,
      name: item.name || "Unknown Business",
      address: item.address || location,
      rating: Number(item.rating) || 0,
      user_ratings_total: Number(item.user_ratings_total) || 0,
      business_status: 'OPERATIONAL',
      website: item.website || null,
      types: Array.isArray(item.types) ? item.types : [category],
      place_id: `pid_${idx}`,
      suggested_solution: item.suggested_solution || "Professional Landing Page",
      suggestion_reason: item.suggestion_reason || "Establishing a digital presence helps attract local organic traffic.",
      email_draft_subject: item.email_draft_subject || `Quick question about ${item.name}`,
      email_draft_body: item.email_draft_body || `Hi team,\n\nI noticed ${item.name} doesn't have a main website. I help local businesses automate their workflows. Would you be open to a quick chat about setting up a ${item.suggested_solution || 'digital system'}?`
    }));

    // STRICT FILTER:
    // 1. Must be OPERATIONAL.
    // 2. Must NOT have a website (null or empty string).
    // This ensures the user only sees actionable leads for web development services.
    return leads.filter(l => 
      l.business_status === 'OPERATIONAL' && 
      (!l.website || l.website.trim() === '')
    );

  } catch (error) {
    console.error("Discovery Engine Error:", error);
    // Return empty array to trigger the "No leads found" UI state instead of crashing
    return [];
  }
}
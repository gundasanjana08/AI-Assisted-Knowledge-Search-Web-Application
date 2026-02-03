
import { GoogleGenAI, Type } from "@google/genai";
import { Document, SearchResult } from "../types";

export class KnowledgeService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Generates an answer based on a user query and a provided set of context documents.
   */
  async queryKnowledgeBase(query: string, contextDocs: Document[]): Promise<SearchResult> {
    if (contextDocs.length === 0) {
      return {
        answer: "I don't have any documents in my knowledge base yet to answer that. Please add some information first!",
        relevantDocs: [],
        query
      };
    }

    // Prepare context text
    const contextText = contextDocs
      .map((doc, idx) => `[Document ${idx + 1}: ${doc.title}]\n${doc.content}`)
      .join("\n\n---\n\n");

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            text: `You are an AI Knowledge Assistant. Use the provided documents to answer the user's question accurately.
            
            RULES:
            1. If the answer is not in the documents, state that you don't have enough information based on the current context.
            2. Be concise but thorough.
            3. Use Markdown for formatting (bold, lists, etc.).
            4. Reference which documents you used by their titles (e.g., "As mentioned in [Title]...").

            CONTEXT DOCUMENTS:
            ${contextText}

            USER QUESTION:
            ${query}`
          }
        ],
        config: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        }
      });

      const answer = response.text || "Sorry, I couldn't generate an answer.";
      
      // For this simple version, we return all docs as "relevant" if we used them.
      // In a real RAG system, we'd filter by similarity score first.
      return {
        answer,
        relevantDocs: contextDocs,
        query
      };
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to get an answer from the AI service.");
    }
  }
}

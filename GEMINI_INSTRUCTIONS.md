# Instructions for Gemini AI Studio

To fix the "Blank Screen" / Loading Error in the generated application, paste the following prompt into Gemini AI Studio:

---

**Prompt:**

The application you generated has a critical issue where it shows a blank white screen on load. This is caused by two main problems:
1.  **Race Condition with CDN:** The app relies on `PapaParse` loading from a CDN script tag in `index.html`. Often, the React app initializes before this script is ready, causing a `ReferenceError: Papa is not defined`.
2.  **Startup Crash in Service:** The `services/geminiService.ts` file attempts to initialize the `GoogleGenAI` client at the top level. If the API key is missing or invalid, this throws an error immediately when the file is imported, crashing the entire app before it can render.

**Please apply the following fixes:**

1.  **Switch to NPM for PapaParse:**
    *   Do not use the CDN link in `index.html`.
    *   Add `papaparse` and `@types/papaparse` to `package.json`.
    *   In `App.tsx`, import PapaParse directly: `import Papa from 'papaparse';`.

2.  **Lazy Load the Gemini Client:**
    *   Refactor `services/geminiService.ts` so that `genAI` and `model` are not initialized at the top level.
    *   Initialize them strictly inside the functions that need them (like `getRecipeIdea` or `identifyFood`), or use a function to get the model instance safely.
    *   Wrap the initialization in a `try-catch` block so the app doesn't crash if the key is missing.

**Example Refactor for `geminiService.ts`:**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY || '';

let model: any = null;

const getModel = () => {
  if (model) return model;
  try {
    if (!API_KEY) throw new Error("API Key missing");
    const genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return model;
  } catch (error) {
    console.warn("Gemini AI Service not available:", error);
    return null;
  }
};

// ... inside your functions (e.g., identifyFood, getRecipeIdea):
// const model = getModel();
// if (!model) throw new Error("AI Service unavailable");
// ...
```
---


export const stripHtml = (html: string) => {
   if (typeof document === 'undefined') return html;
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
};

export const truncateText = (text: string) => {
     if (!text) return "";
     let clean = text;

     // --- FLOW STEP 1: Remove "More Info" Pointers ---
     // Priority: High. These are navigation hints, not content.
     clean = clean.replace(/[\(\[]\s*More info.*?[\)\]]/gi, '');

     // --- FLOW STEP 2: Remove Bracketed Content ---
     // Priority: Medium. Removes citations [1], notes [Note], or internal codes [///].
     clean = clean.replace(/\[[^\]]*\]/g, '');
     
     // --- FLOW STEP 3: Truncate at Basis Markers ---
     // Priority: Critical. Separates "Summary" from "Detailed Reference Data".
     // Matches G:, B:, R: at start of line or after whitespace, and everything after.
     // The regex [\s\S]* ensures it captures across newlines.
     clean = clean.replace(/(\s+|^)[GBR]:[\s\S]*/i, '');

     // --- FLOW STEP 4: Final Polish ---
     // Remove leading/trailing punctuation and whitespace
     clean = clean.replace(/^[\s\.,;:\-]+|[\s\.,;:\-]+$/g, '');

     return clean.trim();
};

export const processMedicinalText = (text: string, expandBooks: boolean = true) => {
    if (!text) return "";
    let content = text;

    // Expand Book Citations
    if (expandBooks) {
        content = content.replace(
            /Lad,\s*p\.\s*(\d+)/gi,
            "The Complete Book of Ayurvedic Home Remedies, Vasant Lad (Page $1)"
        );
        content = content.replace(
            /CCRAS,\s*p\.\s*(\d+)/gi,
            "CCRA, Ministry of Health (Page $1)"
        );
    }

    // Handle Research Citations: Remove emoji wrappers and keep ID
    content = content.replace(/\[(?:📌|🔬)\s*"?(?:[^"]*?)?((?:PMCID:\s*PMC\d+)|(?:PMID:\s*\d+))"?.?\]/gi, '$1');

    // Clean up any remaining citation wrappers
    content = content.replace(/\[(?:📌|🔬)\s*/g, '').replace(/\]/g, '');

    // Expand Codes with Bold and Italic formatting for Ayurveda/Science ratings
    const ratings = [
        { key: "Ayur: E", label: "Ayurvedic", val: "Excellent" },
        { key: "Ayur: G", label: "Ayurvedic", val: "Good" },
        { key: "Ayur: N", label: "Ayurvedic", val: "Nominal" },
        { key: "Sci: S", label: "Scientific studies", val: "Strong" },
        { key: "Sci: M", label: "Scientific studies", val: "Moderate" },
        { key: "Sci: L", label: "Scientific studies", val: "Limited" },
        { key: "Sci: N", label: "Scientific studies", val: "None" },
    ];

    ratings.forEach(r => {
        // Regex handles varied spacing: Ayur:E, Ayur: E, etc.
        const regex = new RegExp(`\\b${r.key.replace(':', ':\\s*')}\\b`, 'gi');
        content = content.replace(regex, `<strong>${r.label}:</strong> <span class="font-bold italic">${r.val}</span>`);
    });

    // Linkify PMCID
    content = content.replace(
        /(PMCID:\s*)(PMC\d+)/gi,
        '<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/$2/" target="_blank" class="text-indigo-600 hover:underline">$1$2</a>'
    );
    
    // Linkify PMID
    content = content.replace(
        /(PMID:\s*)(\d+)/gi,
        '<a href="https://pubmed.ncbi.nlm.nih.gov/$2/" target="_blank" class="text-indigo-600 hover:underline">$1$2</a>'
    );

    // Ensure newlines are preserved as HTML line breaks
    return content.replace(/\n/g, '<br />');
};

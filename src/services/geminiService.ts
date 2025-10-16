import type { ComplianceReport } from '../types';

/**
 * MOCK IMPLEMENTATION
 * This function simulates a call to the Gemini API.
 *
 * Why is this mocked?
 * 1.  Security: API keys cannot be safely stored in frontend code that runs in the browser.
 * 2.  Deployability: This allows the app to be deployed on static hosting (like GitHub pages)
 *     and be fully interactive without a backend server to protect the API key.
 *
 * In a real-world application, this function would make a secure call to a backend service,
 * which would then call the Gemini API with the protected key.
 */
export const assessContent = async (content: string, standardName: string): Promise<ComplianceReport> => {
    console.log("Using mock Gemini service. Simulating a 2-second API call...");

    const mockReport: ComplianceReport = {
      score: 65,
      summary: `This is a mock assessment for the '${standardName}' standard. The document shows a foundational understanding of compliance but lacks specific safeguards for sensitive information and does not include a clear notice of practices. Several clauses are too vague.`,
      issues: [
        {
          nonCompliantText: "All patient data is kept confidential.",
          reason: "This statement is too broad. The selected standard requires specifying *how* data is kept confidential, including technical, physical, and administrative safeguards.",
          suggestion: "Replace with 'All sensitive information is protected through administrative, physical, and technical safeguards, including access controls, encryption of data at rest and in transit, and regular staff training.'"
        },
        {
          nonCompliantText: "We may share your information with partners for marketing purposes.",
          reason: "Sharing personal information for marketing purposes requires explicit, opt-in user consent under most data privacy regulations. This statement implies sharing without explicit authorization.",
          suggestion: "Remove this clause or rephrase to: 'We will not use or disclose your personal information for marketing purposes without your prior written authorization.'"
        }
      ],
      recommendations: [
        "Incorporate a dedicated 'Notice of Privacy Practices' or 'Data Usage Policy' section that is easily accessible.",
        "Explicitly mention the encryption standards used for protecting electronic records.",
        "Add a clause regarding third-party data sharing agreements for any vendors who may handle user data."
      ]
    };

    // To make the highlighting feel real, we'll dynamically grab some text
    // from the user's actual input to use as the "nonCompliantText".
    if (content.trim()) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length > 0) {
          mockReport.issues[0].nonCompliantText = sentences[0].trim();
      } else if (content.length > 20) {
          const firstChunkEnd = content.indexOf(' ', 20) !== -1 ? content.indexOf(' ', 20) : Math.min(content.length, 30);
          mockReport.issues[0].nonCompliantText = content.substring(0, firstChunkEnd).trim();
      } else {
         mockReport.issues[0].nonCompliantText = content.trim();
      }

      if (sentences.length > 1) {
          mockReport.issues[1].nonCompliantText = sentences[1].trim();
      } else if (content.length > 80) {
          const secondChunkStart = Math.max(0, content.length - 40);
          mockReport.issues[1].nonCompliantText = content.substring(secondChunkStart).trim();
      } else {
        // If there's only one issue, we can remove the second one.
        mockReport.issues.pop();
      }
    } else {
        // If content is empty, just use the default text.
    }


    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockReport);
        }, 2000); // Simulate a 2-second API call
    });
};

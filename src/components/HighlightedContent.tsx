import React from 'react';
import type { ComplianceIssue } from '../types';

interface HighlightedContentProps {
    content: string;
    issues: ComplianceIssue[];
}

const HighlightedContent: React.FC<HighlightedContentProps> = ({ content, issues }) => {
    // Escape characters that have special meaning in regular expressions
    const escapeRegex = (str: string) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // Create a unique set of issue texts to build the regex and a map for quick suggestion lookups
    const uniqueIssueTexts = [...new Set(issues.map(issue => issue.nonCompliantText))];
    const issueMap = new Map<string, string>();
    issues.forEach(issue => {
        if (!issueMap.has(issue.nonCompliantText)) {
            issueMap.set(issue.nonCompliantText, issue.suggestion);
        }
    });

    // If there are no issues, just display the plain content
    if (uniqueIssueTexts.length === 0) {
        return (
            <div className="p-4 border border-slate-300 rounded-md bg-slate-50 min-h-[280px] h-full overflow-y-auto">
                <p className="whitespace-pre-wrap font-sans text-sm text-slate-800">{content}</p>
            </div>
        );
    }
    
    // Create a single regex to find all occurrences of any non-compliant text
    const regex = new RegExp(`(${uniqueIssueTexts.map(escapeRegex).join('|')})`, 'g');
    const parts = content.split(regex);

    return (
        <div className="p-4 border border-slate-300 rounded-md bg-white min-h-[280px] max-h-[312px] h-full overflow-y-auto" role="document" aria-label="Assessed document content">
            <p className="whitespace-pre-wrap font-sans text-sm text-slate-800 leading-relaxed">
                {parts.map((part, index) => {
                    const suggestion = issueMap.get(part);
                    // If the part is a non-compliant text, wrap it in a styled span with a tooltip
                    if (suggestion) {
                        return (
                            <span key={index} className="relative group cursor-pointer bg-red-50" aria-describedby={`tooltip-${index}`}>
                                <span className="underline decoration-red-500 decoration-dotted decoration-2 underline-offset-2">{part}</span>
                                <span 
                                    id={`tooltip-${index}`}
                                    role="tooltip"
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2.5 text-xs text-white bg-slate-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                                >
                                    <strong>Suggestion:</strong> {suggestion}
                                    <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                        <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                                    </svg>
                                </span>
                            </span>
                        );
                    }
                    // Otherwise, render the text part as is
                    return <React.Fragment key={index}>{part}</React.Fragment>;
                })}
            </p>
        </div>
    );
};

export default HighlightedContent;

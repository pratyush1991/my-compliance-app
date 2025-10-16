import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Geography } from './types';
import type { GeographyValue, Standard, ComplianceReport } from './types';
import { GEOGRAPHY_STANDARDS_MAP } from './constants';
import { assessContent } from './services/geminiService';
import { FileTextIcon, JsonIcon, UploadIcon } from './components/Icons';
import Spinner from './components/Spinner';
import HighlightedContent from './components/HighlightedContent';

// Helper function to create a downloadable file
const downloadFile = (filename: string, content: string, mimeType: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: mimeType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

const Header: React.FC = () => (
    <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-800">AI Healthcare Compliance Assessor</h1>
            <p className="text-slate-500 mt-1">Assess your documents against global healthcare standards with Gemini.</p>
        </div>
    </header>
);

const ComplianceScore: React.FC<{ score: number }> = ({ score }) => {
    const getScoreColor = (s: number) => {
        if (s >= 90) return 'text-green-600 bg-green-100';
        if (s >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className={`text-center p-4 rounded-lg ${getScoreColor(score)}`}>
            <div className="text-sm font-medium">Compliance Score</div>
            <div className="text-4xl font-bold">{score}/100</div>
        </div>
    );
};

const ReportDisplay: React.FC<{ report: ComplianceReport, onExport: (format: 'txt' | 'json') => void }> = ({ report, onExport }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700">Assessment Report</h2>
                <div className="flex space-x-2">
                    <button onClick={() => onExport('txt')} className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-md text-sm transition-colors">
                        <FileTextIcon /> <span>TXT</span>
                    </button>
                    <button onClick={() => onExport('json')} className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-md text-sm transition-colors">
                        <JsonIcon /> <span>JSON</span>
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto flex-grow pr-2">
                <div className="space-y-6">
                    <ComplianceScore score={report.score} />

                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Summary</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{report.summary}</p>
                    </div>

                    {report.issues.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">Compliance Issues Found</h3>
                            <ul className="space-y-4">
                                {report.issues.map((issue, index) => (
                                    <li key={index} className="bg-red-50 border border-red-200 p-4 rounded-md">
                                        <p className="text-sm text-red-800 font-medium mb-2">Issue #{index + 1}</p>
                                        <blockquote className="border-l-4 border-red-400 pl-3 text-sm text-slate-600 italic my-2">"{issue.nonCompliantText}"</blockquote>
                                        <p className="text-sm text-slate-700"><strong className="font-medium">Reason:</strong> {issue.reason}</p>
                                        <p className="text-sm text-green-700 mt-2"><strong className="font-medium text-green-800">Suggestion:</strong> {issue.suggestion}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                     {report.recommendations.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-2">General Recommendations</h3>
                            <ul className="space-y-2 list-disc list-inside">
                                {report.recommendations.map((rec, index) => (
                                    <li key={index} className="text-sm text-slate-600">{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [geography, setGeography] = useState<GeographyValue | ''>('');
    const [standard, setStandard] = useState<Standard | null>(null);
    const [content, setContent] = useState('');
    const [report, setReport] = useState<ComplianceReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const availableStandards = useMemo(() => {
        if (!geography) return [];
        return GEOGRAPHY_STANDARDS_MAP[geography];
    }, [geography]);
    
    const isAssessButtonDisabled = !geography || !standard || !content || isLoading;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setContent(text);
            };
            reader.readAsText(file);
        }
    };

    const handleAssess = useCallback(async () => {
        if (!standard || !content) return;
        
        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const result = await assessContent(content, standard.name);
            setReport(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [content, standard]);

    const handleExport = useCallback((format: 'txt' | 'json') => {
        if (!report) return;

        if (format === 'json') {
            const jsonContent = JSON.stringify(report, null, 2);
            downloadFile('compliance_report.json', jsonContent, 'application/json');
        } else {
            let txtContent = `AI Healthcare Compliance Assessment Report\n`;
            txtContent += `=========================================\n\n`;
            txtContent += `Overall Compliance Score: ${report.score}/100\n\n`;
            txtContent += `Summary:\n${report.summary}\n\n`;

            if(report.issues.length > 0) {
                txtContent += `Compliance Issues:\n------------------\n`;
                report.issues.forEach((issue, i) => {
                    txtContent += `\nIssue #${i + 1}:\n`;
                    txtContent += `  - Text: "${issue.nonCompliantText}"\n`;
                    txtContent += `  - Reason: ${issue.reason}\n`;
                    txtContent += `  - Suggestion: ${issue.suggestion}\n`;
                });
            }

            if(report.recommendations.length > 0) {
                 txtContent += `\n\nGeneral Recommendations:\n------------------------\n`;
                report.recommendations.forEach((rec, i) => {
                    txtContent += `${i + 1}. ${rec}\n`;
                });
            }
            downloadFile('compliance_report.txt', txtContent, 'text/plain');
        }
    }, [report]);

    const handleClearReport = () => {
        setReport(null);
        setError(null);
    };

    const handleClearContent = () => {
        setContent('');
    };

    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Inputs */}
                    <div className="space-y-6">
                        {/* Step 1: Geography */}
                        <div>
                            <label htmlFor="geography" className="block text-sm font-medium text-slate-700">1. Select Geography</label>
                            <select
                                id="geography"
                                value={geography}
                                onChange={(e) => {
                                    setGeography(e.target.value as GeographyValue);
                                    setStandard(null); // Reset standard on geography change
                                }}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                            >
                                <option value="" disabled>Choose a region...</option>
                                {Object.values(Geography).map(geo => <option key={geo} value={geo}>{geo}</option>)}
                            </select>
                        </div>
                        
                        {/* Step 2: Standard */}
                        <div>
                            <label htmlFor="standard" className="block text-sm font-medium text-slate-700">2. Select Healthcare Standard</label>
                            <select
                                id="standard"
                                value={standard?.id || ''}
                                onChange={(e) => {
                                    const selectedStandard = availableStandards.find(s => s.id === e.target.value) || null;
                                    setStandard(selectedStandard);
                                }}
                                disabled={!geography}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md disabled:bg-slate-100"
                            >
                                <option value="" disabled>Choose a standard...</option>
                                {availableStandards.map(std => <option key={std.id} value={std.id}>{std.name} - {std.description}</option>)}
                            </select>
                        </div>

                        {/* Step 3: Content */}
                        <div>
                             <div className="flex justify-between items-center">
                                <label htmlFor="content" className="block text-sm font-medium text-slate-700">3. Provide Content</label>
                                 <div className="flex items-center space-x-4">
                                    {!report && content && (
                                        <button onClick={handleClearContent} className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">
                                            Clear
                                        </button>
                                    )}
                                    {report && (
                                        <button onClick={handleClearReport} className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors">
                                            Edit Content
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="mt-1">
                                {report && report.issues.length > 0 ? (
                                    <HighlightedContent content={content} issues={report.issues} />
                                ) : (
                                    <textarea
                                        id="content"
                                        rows={10}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Paste your document content here..."
                                        className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-slate-300 rounded-md"
                                    />
                                )}
                            </div>
                            {!report && (
                                <>
                                    <div className="mt-2 flex items-center justify-center text-sm text-slate-500">
                                        <span className="flex-grow border-t border-slate-200"></span>
                                        <span className="px-2">OR</span>
                                        <span className="flex-grow border-t border-slate-200"></span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".txt,.md,.html"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 w-full flex justify-center items-center space-x-2 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                                    >
                                        <UploadIcon />
                                        <span>Upload a Document (.txt, .md)</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleAssess}
                                disabled={isAssessButtonDisabled}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? <Spinner /> : 'Assess Compliance'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Report Display */}
                    <div>
                        {isLoading ? (
                            <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Spinner />
                                    <p className="mt-4 text-slate-500">Analyzing your document...</p>
                                    <p className="text-sm text-slate-400">This may take a moment.</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md h-full text-center flex flex-col justify-center">
                                <h3 className="text-lg font-semibold text-red-800">An Error Occurred</h3>
                                <p className="mt-2 text-sm text-red-700">{error}</p>
                                <button onClick={() => setError(null)} className="mt-4 mx-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                                    Try Again
                                </button>
                            </div>
                        ) : report ? (
                            <ReportDisplay report={report} onExport={handleExport} />
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200">
                                <svg className="w-16 h-16 text-slate-300" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h2 className="mt-4 text-lg font-medium text-slate-600">Your Compliance Report Will Appear Here</h2>
                                <p className="mt-1 text-sm text-slate-500">Fill in the details on the left and click "Assess Compliance" to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

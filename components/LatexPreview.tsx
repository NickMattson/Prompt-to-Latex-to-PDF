import React, { useRef, useState } from 'react';
import { IconCopy, IconExternalLink, IconCheck, IconCode } from './Icons';

interface LatexPreviewProps {
  latex: string;
}

const LatexPreview: React.FC<LatexPreviewProps> = ({ latex }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [copied, setCopied] = useState(false);

  const handleOpenOverleaf = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
      <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-start space-x-4">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <IconCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Document Ready!</h3>
            <p className="text-slate-600 mt-1">
              Your LaTeX code has been generated with professional styling.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-3">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {copied ? <IconCheck className="w-5 h-5" /> : <IconCopy className="w-5 h-5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleOpenOverleaf}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/30 hover:scale-[1.02] transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <IconExternalLink className="w-5 h-5" />
            <span>Open in Overleaf</span>
          </button>
        </div>
      </div>

      {/* Optional: Collapsible or small code peek could go here, but keeping it simple as requested */}
      
      {/* Hidden Form for Overleaf POST */}
      <form
        ref={formRef}
        action="https://www.overleaf.com/docs"
        method="post"
        target="_blank"
        className="hidden"
      >
        <textarea name="snip" value={latex} readOnly />
      </form>
    </div>
  );
};

export default LatexPreview;

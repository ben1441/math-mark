import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MarkdownPreview } from './components/MarkdownPreview';
import { Button } from './components/Button';
import { enhanceMarkdown, generateContent, editMarkdown } from './services/geminiService';
import { 
  Download, 
  Wand2, 
  LayoutTemplate, 
  Printer, 
  Eraser, 
  Maximize2, 
  Minimize2,
  MoreHorizontal
} from 'lucide-react';

const INITIAL_CONTENT = `# MathMark Live

Welcome to the **premium markdown editor** designed for mathematics.

## Equation Showcase
It supports **LaTeX** formatting out of the box. 

Inline math looks like this: $E = mc^2$.

Complex inline equation: $o_{i}(x,w_{i})=\\frac{1}{1+exp(-w_{i}\\cdot x)}$

Block equations are rendered beautifully:

$$
o_{i}(x,w_{i})=\\frac{1}{1+exp(-w_{i}\\cdot x)}
$$

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## Features
1. **Live Preview**: Type on the left, see it on the right.
2. **Export to PDF**: Just click the print button.
3. **Gemini AI**: Use the Magic Wand to fix formatting or generate content.

## Tables
| Feature | Support | Status |
| :--- | :--- | :--- |
| Math | ✅ KaTeX | Excellent |
| Tables | ✅ GFM | Perfect |
| Code | ✅ Syntax | Ready |

\`\`\`python
# Example Code
def sigmoid(x):
    return 1 / (1 + math.exp(-x))
\`\`\`
`;

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(INITIAL_CONTENT);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [promptText, setPromptText] = useState("");
  
  // Ref for the editor to sync scroll or focus
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the editor?")) {
      setMarkdown("");
    }
  };

  const handleMagicFix = async () => {
    if (!markdown.trim()) return;
    
    setIsAiLoading(true);
    try {
      const improved = await enhanceMarkdown(markdown);
      setMarkdown(improved);
    } catch (err) {
      alert("Failed to enhance content. Please check your API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    
    setIsAiLoading(true);
    try {
      const generated = await generateContent(promptText, markdown);
      // Append generated content with a newline
      setMarkdown(prev => prev + "\n\n" + generated);
      setPromptText("");
      setShowPromptInput(false);
    } catch (err) {
      alert("Failed to generate content. Ensure GEMINI_API_KEY is set.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!promptText.trim()) return;

    setIsAiLoading(true);
    try {
      const edited = await editMarkdown(promptText, markdown);
      setMarkdown(edited);
      setPromptText("");
      setShowPromptInput(false);
    } catch (err) {
      alert("Failed to edit content. Ensure GEMINI_API_KEY is set.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((e) => {
            console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
        });
        setIsFullscreen(true);
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }
  };

  // Keyboard shortcut for print
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 flex flex-col font-sans">
      {/* Header / Toolbar - Sticky */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80 no-print">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold font-mono">
              M
            </div>
            <h1 className="font-semibold text-lg tracking-tight text-gray-900">MathMark</h1>
          </div>

          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center bg-gray-100/50 p-1 rounded-lg border border-gray-200/50 mr-2">
                <Button variant="ghost" size="sm" onClick={() => setMarkdown(INITIAL_CONTENT)} title="Reset Demo">
                    Reset
                </Button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <span className="text-xs text-gray-400 px-2">
                   {markdown.split(/\s+/).filter(Boolean).length} words
                </span>
             </div>

            <Button 
                variant="secondary" 
                size="md" 
                onClick={handlePrint}
                icon={<Printer size={16} />}
            >
                <span className="hidden sm:inline">Export PDF</span>
            </Button>

            <div className="relative">
                <Button 
                    variant="primary" 
                    size="md" 
                    isLoading={isAiLoading}
                    onClick={() => setShowPromptInput(!showPromptInput)}
                    icon={<Wand2 size={16} />}
                >
                    <span className="hidden sm:inline">AI Assist</span>
                </Button>
                
                {/* AI Dropdown/Popover */}
                {showPromptInput && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 z-50">
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">Magic Actions</h3>
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full justify-start mb-2" 
                                    onClick={handleMagicFix}
                                    disabled={isAiLoading}
                                >
                                    <Wand2 size={14} className="mr-2 text-purple-500" />
                                    Fix Grammar & Format Equations
                                </Button>
                            </div>
                            <div className="border-t border-gray-100 pt-2">
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Generate Content</label>
                                <textarea 
                                    className="w-full text-sm p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none transition-all"
                                    rows={3}
                                    placeholder="e.g., Write a proof for Euler's formula..."
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            handleGenerate();
                                        }
                                    }}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button variant="ghost" size="sm" onClick={handleEdit} disabled={!promptText.trim() || isAiLoading} title="Replaces content based on instruction">
                                        Edit
                                    </Button>
                                    <Button size="sm" onClick={handleGenerate} disabled={!promptText.trim() || isAiLoading} title="Appends new content">
                                        Generate
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 h-[calc(100vh-4rem)]">
        
        {/* Editor Pane */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-200/60 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] no-print relative group editor-section">
           <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
           
           <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleClear} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Clear All">
                    <Eraser size={16} />
                </button>
                <button onClick={toggleFullscreen} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
           </div>

           <textarea
             ref={editorRef}
             value={markdown}
             onChange={(e) => setMarkdown(e.target.value)}
             className="flex-1 w-full h-full p-6 lg:p-8 resize-none font-mono text-sm leading-relaxed text-gray-800 focus:outline-none custom-scrollbar bg-transparent z-0"
             placeholder="Start typing markdown here..."
             spellCheck={false}
           />
           <div className="h-8 bg-gray-50 border-t border-gray-100 flex items-center px-4 text-xs text-gray-400 font-medium tracking-wide uppercase select-none">
             Markdown Source
           </div>
        </section>

        {/* Preview Pane */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-200/60 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] print-only" id="preview-container">
            {/* Added specific class for print targeting of the scroll container */}
            <div className="flex-1 w-full h-full overflow-y-auto p-8 lg:p-12 custom-scrollbar preview-content-scroll">
                <MarkdownPreview content={markdown} />
            </div>
             <div className="h-8 bg-gray-50 border-t border-gray-100 flex items-center px-4 text-xs text-gray-400 font-medium tracking-wide uppercase select-none no-print">
             Live Preview
           </div>
        </section>

      </main>
    </div>
  );
};

export default App;
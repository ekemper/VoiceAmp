import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState, useEffect } from "react";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore: If dompurify types are missing, install with: npm install dompurify @types/dompurify
import DOMPurify from 'dompurify';
import React from 'react';

function fileArrayToFileList(files: File[]): FileList {
  const dataTransfer = new DataTransfer();
  files.forEach(file => dataTransfer.items.add(file));
  return dataTransfer.files;
}

export default function DemoSection() {
  const { toast } = useToast();
  const { ref: refSection, inView: inViewSection } = useScrollAnimation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [processingFiles, setProcessingFiles] = useState<{ [key: string]: boolean }>({});
  const [voiceText, setVoiceText] = useState("");
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [querySources, setQuerySources] = useState<string[] | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // Log every render
  console.log("[RENDER] DemoSection", {
    processingFiles,
    uploadedFiles,
    currentStep,
    isLoading
  });

  // Log state changes
  useEffect(() => {
    console.log("[STATE CHANGE] processingFiles:", processingFiles);
  }, [processingFiles]);

  useEffect(() => {
    console.log("[STATE CHANGE] uploadedFiles:", uploadedFiles);
  }, [uploadedFiles]);

  useEffect(() => {
    console.log("[STATE CHANGE] currentStep:", currentStep);
  }, [currentStep]);

  useEffect(() => {
    console.log("[STATE CHANGE] isLoading:", isLoading);
  }, [isLoading]);

  // Sanitize input for XSS and basic SQLi patterns
  function sanitizeInput(input: string) {
    let clean = DOMPurify.sanitize(input, {ALLOWED_TAGS: [], ALLOWED_ATTR: []});
    clean = clean.replace(/['";\-\-]/g, '');
    return clean;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    
    for (const file of files) {
      console.log(`[UPLOAD] Starting upload for ${file.name}`);
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Start processing state
        setProcessingFiles(prev => {
          console.log(`[STATE] Setting processing state for ${file.name}`);
          return { ...prev, [file.name]: true };
        });

        // Make the API call
        console.log(`[FETCH] Making API call for ${file.name}`);
        const response = await fetch('http://localhost:5001/upload', {
          method: 'POST',
          body: formData
        });

        console.log(`[FETCH] Received response for ${file.name}:`, response.status);
        const data = await response.json();

        // Clear processing state only after we get the response
        setProcessingFiles(prev => {
          console.log(`[STATE] Clearing processing state for ${file.name}`);
          const newProcessing = { ...prev };
          delete newProcessing[file.name];
          return newProcessing;
        });

        if (response.status === 201) {
          setUploadedFiles(prev => {
            console.log(`[STATE] Marking ${file.name} as uploaded`);
            return [...prev, file];
          });
          toast({
            title: "Success",
            description: `${file.name} uploaded successfully`,
            variant: "default",
          });
        } else {
          const errorMessage = data.error || 'Upload failed';
          console.log(`[ERROR] Upload failed for ${file.name}: ${errorMessage}`);
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(`[ERROR] Exception uploading ${file.name}:`, error);
        setProcessingFiles(prev => {
          console.log(`[STATE] Clearing processing state for ${file.name} after exception`);
          const newProcessing = { ...prev };
          delete newProcessing[file.name];
          return newProcessing;
        });
        
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        });
      }
    }
  };

  // Upload the voice context as a file
  const handleVoiceSubmit = async () => {
    if (!voiceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description before submitting.",
        variant: "destructive",
      });
      return;
    }
    const sanitized = sanitizeInput(voiceText.trim());
    const timestamp = Date.now();
    const filename = `voice_context_${timestamp}.txt`;
    const file = new File([sanitized], filename, { type: 'text/plain' });
    // Reuse the upload logic by creating a mock event with a real FileList
    const mockEvent = {
      target: {
        files: fileArrayToFileList([file]),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    await handleFileUpload(mockEvent);
    // Optionally clear the textarea after upload
    setVoiceText("");
  };

  // Handle AI Assistant Query
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueryResult(null);
    setQuerySources(null);
    const sanitized = sanitizeInput(queryText.trim());
    if (!sanitized) {
      toast({
        title: "Error",
        description: "Please enter a question before submitting.",
        variant: "destructive",
      });
      return;
    }
    setQueryLoading(true);
    try {
      const response = await fetch('http://localhost:5001/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sanitized })
      });
      const data = await response.json();
      if (response.ok && data.response) {
        setQueryResult(data.response);
        setQuerySources(data.sources || null);
      } else {
        setQueryResult(data.error || 'An error occurred.');
        setQuerySources(null);
      }
    } catch (err) {
      setQueryResult('An error occurred while contacting the AI assistant.');
      setQuerySources(null);
    } finally {
      setQueryLoading(false);
    }
  };

  return (
    <div>
      {/* Main section with the ID for scrolling */}
      <section id="demo" className="py-16 md:py-24 bg-gradient-navy-teal text-white relative scroll-mt-[100px]">
        <div className="absolute inset-0 bg-wave-pattern opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div 
            ref={refSection}
            className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
              inViewSection ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-medium mb-6 font-inter">
              <span className="text-amber">Amplifying voices.</span> Streamlining grants. Making funding more accessible for mission-driven organizations.
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-4">
              See how our AI-powered platform can transform your grant writing process.
            </p>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Try the interactive demo below.
            </p>
            
            <div className="bg-white rounded-xl p-8 shadow-xl text-left border border-teal/20">
              <div className="mb-6">
                <div className="flex items-center mb-5">
                  <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-robot-line text-xl text-teal"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-navy">VoiceAmp AI Assistant</h3>
                    <p className="text-navy/70 text-sm">Enhancing your grant application responses</p>
                  </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-teal text-white' : 'bg-gray-200 text-gray-600'}`}>
                      1
                    </div>
                    <div className={`h-1 w-16 mx-2 ${currentStep >= 2 ? 'bg-teal' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-teal text-white' : 'bg-gray-200 text-gray-600'}`}>
                      2
                    </div>
                    <div className={`h-1 w-16 mx-2 ${currentStep >= 3 ? 'bg-teal' : 'bg-gray-200'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-teal text-white' : 'bg-gray-200 text-gray-600'}`}>
                      3
                    </div>
                  </div>
                </div>

                {/* Step 1: Describe Your Voice */}
                {currentStep === 1 && (
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-navy mb-6">Step 1: Describe Your Voice</h3>
                    <div className="bg-navy/5 p-4 rounded-lg mb-6">
                      <p className="text-navy font-medium">
                        Please describe the voice you would like to have in answering grant application questions. How do you want your voice to be heard? What specific characteristics make you who you are? You are doing important work. Brag a little!
                      </p>
                    </div>
                    <div className="border-2 border-dashed border-teal/30 rounded-lg p-8 text-center">
                      <textarea 
                        className="w-full h-32 p-4 rounded-lg border border-teal/30 focus:outline-none focus:ring-2 focus:ring-teal/50 text-black"
                        placeholder="Describe your organization's voice..."
                        value={voiceText}
                        onChange={e => setVoiceText(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end mt-6 gap-4">
                      <button 
                        onClick={handleVoiceSubmit}
                        className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal/90 transition-colors"
                      >
                        Submit & Upload
                      </button>
                      <button 
                        onClick={() => setCurrentStep(2)}
                        className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal/90 transition-colors"
                      >
                        Continue to Document Upload
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload Context Documents */}
                {currentStep === 2 && (
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-navy mb-6">Step 2: Upload Context Documents</h3>
                    <div className="bg-navy/5 p-4 rounded-lg mb-6">
                      <p className="text-navy font-medium">
                        Add as much context about your organization as possible. Mission, Vision, Projects, Relationships, Strategies, etc.
                      </p>
                    </div>

                    <div className="border-2 border-dashed border-teal/30 rounded-lg p-8 text-center">
                      <div className="flex flex-col items-center">
                        <i className="ri-upload-cloud-line text-4xl text-teal mb-4"></i>
                        <p className="text-navy mb-4">Drag and drop files here or</p>
                        <label className={`${
                          Object.keys(processingFiles).length > 0 
                            ? 'bg-teal/50 cursor-not-allowed'
                            : 'bg-teal cursor-pointer hover:bg-teal/90'
                          } text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2`}
                        >
                          {Object.keys(processingFiles).length > 0 ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Parsing Context Document...</span>
                            </>
                          ) : (
                            <>
                              Browse Files
                              <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                accept=".pdf,.txt,.rtf"
                                onChange={handleFileUpload}
                                disabled={Object.keys(processingFiles).length > 0}
                              />
                            </>
                          )}
                        </label>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <p className="text-navy/70 text-sm mb-2">Uploaded files:</p>
                          <ul className="text-left">
                            {uploadedFiles.map((file, index) => (
                              <li key={index} className="text-navy flex items-center">
                                <i className="ri-file-text-line mr-2"></i>
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between mt-6">
                      <button 
                        onClick={() => setCurrentStep(1)}
                        className="text-teal hover:text-teal/80 transition-colors"
                      >
                        ← Back to Voice Description
                      </button>
                      <button 
                        onClick={() => setCurrentStep(3)}
                        className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal/90 transition-colors"
                      >
                        Continue to AI Assistant
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: AI Assistant */}
                {currentStep === 3 && (
                  <div>
                    <h3 className="text-2xl font-bold text-navy mb-6">Step 3: AI Assistant</h3>
                    <form onSubmit={handleQuerySubmit} className="mb-6 bg-gray-custom/20 p-5 rounded-lg border border-teal/10">
                      <label htmlFor="ai-query" className="block text-navy font-medium mb-2">Paste your grant question or prompt below:</label>
                      <input
                        id="ai-query"
                        type="text"
                        className="w-full p-3 rounded-lg border border-teal/30 focus:outline-none focus:ring-2 focus:ring-teal/50 text-black mb-4"
                        placeholder="e.g. What relationships do you cultivate that are essential to doing your work?"
                        value={queryText}
                        onChange={e => setQueryText(e.target.value)}
                        disabled={queryLoading}
                      />
                      <button
                        type="submit"
                        className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal/90 transition-colors"
                        disabled={queryLoading}
                      >
                        {queryLoading ? 'Thinking...' : 'Ask AI'}
                      </button>
                    </form>
                    <div className="bg-gray-custom/20 p-5 rounded-lg border-l-4 border-amber">
                      <div className="flex items-start mb-2">
                        <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          <i className="ri-magic-line text-sm text-white"></i>
                        </div>
                        <div>
                          <p className="text-sm text-navy/70 mb-1">VoiceAmp Enhanced Response</p>
                          <div className="text-navy whitespace-pre-line">
                            {queryLoading && '...loading'}
                            {!queryLoading && queryResult && (
                              <>
                                <div>{queryResult}</div>
                                {querySources && querySources.length > 0 && (
                                  <div className="mt-2 text-xs text-navy/60">
                                    <strong>Sources:</strong> {querySources.join(', ')}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button 
                        onClick={() => setCurrentStep(2)}
                        className="text-teal hover:text-teal/80 transition-colors"
                      >
                        ← Back to Document Upload
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { useState } from "react";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function DemoSection() {
  const { toast } = useToast();
  const { ref: refSection, inView: inViewSection } = useScrollAnimation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:5001/upload');
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            setUploadedFiles(prev => [...prev, file]);
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
            toast({
              title: "Success",
              description: `${file.name} uploaded successfully`,
              variant: "default",
            });
          } else {
            let errorMessage = 'Upload failed';
            try {
              const response = JSON.parse(xhr.responseText);
              errorMessage = response.error || errorMessage;
            } catch (e) {
              // If parsing fails, use the default error message
            }
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          }
        };

        xhr.onerror = () => {
          toast({
            title: "Error",
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: "destructive",
          });
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        };

        xhr.send(formData);
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to upload ${file.name}. Please try again.`,
          variant: "destructive",
        });
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
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
                        className="w-full h-32 p-4 rounded-lg border border-teal/30 focus:outline-none focus:ring-2 focus:ring-teal/50"
                        placeholder="Describe your organization's voice..."
                      />
                    </div>
                    
                    <div className="flex justify-end mt-6">
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
                        <label className="bg-teal text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal/90 transition-colors">
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept=".pdf,.txt,.rtf"
                            onChange={handleFileUpload}
                          />
                          Browse Files
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
                      {Object.entries(uploadProgress).map(([fileName, progress]) => (
                        <div key={fileName} className="mt-4">
                          <p className="text-navy/70 text-sm">{fileName}</p>
                          <Progress value={progress} className="w-full h-2" />
                        </div>
                      ))}
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
                    <div className="mb-6 bg-gray-custom/20 p-5 rounded-lg border border-teal/10">
                      <div className="flex items-start mb-2">
                        <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          <i className="ri-question-line text-sm text-white"></i>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-navy">Example Grant Question</h4>
                          <p className="text-navy mt-2 text-xl italic">
                            What relationships do you cultivate that are essential to doing your work?
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-custom/20 p-5 rounded-lg border-l-4 border-amber">
                      <div className="flex items-start mb-2">
                        <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                          <i className="ri-magic-line text-sm text-white"></i>
                        </div>
                        <div>
                          <p className="text-sm text-navy/70 mb-1">VoiceAmp Enhanced Response</p>
                          <div className="text-navy whitespace-pre-line">
                            {isLoading ? "...loading" : ""}
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
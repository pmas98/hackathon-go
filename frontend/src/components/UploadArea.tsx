import { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { cn, isValidCSVFile, formatFileSize } from '@/lib/utils';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onFileRemove: () => void;
  isUploading?: boolean;
  className?: string;
}

export function UploadArea({ 
  onFileSelect, 
  selectedFile, 
  onFileRemove, 
  isUploading = false,
  className 
}: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => isValidCSVFile(file));
    
    if (csvFile) {
      onFileSelect(csvFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidCSVFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className={cn("w-full", className)}>
      {!selectedFile ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-20 text-center transition-all duration-700 group overflow-hidden",
            isDragOver 
              ? "border-purple-400 bg-purple-500/10 scale-[1.02] shadow-2xl shadow-purple-500/30" 
              : "border-white/30 hover:border-purple-400/50 hover:bg-white/5",
            isUploading && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400/40 rounded-full animate-ping delay-1000" />
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400/50 rounded-full animate-ping delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-ping delay-1500" />
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400/40 rounded-full animate-ping delay-3000" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl group-hover:scale-110 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-700 shadow-xl sm:shadow-2xl">
              <div className="relative">
                <Upload className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-purple-300 group-hover:text-purple-200 transition-colors duration-500" />
                <Sparkles className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 lg:-top-3 lg:-right-3 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-300 animate-pulse" />
                <Zap className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 lg:-bottom-2 lg:-left-2 h-3 w-3 sm:h-4 sm:w-4 lg:h-4 lg:w-4 text-pink-300 animate-pulse delay-500" />
              </div>
            </div>
            
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Arraste e solte seu arquivo CSV aqui
              </h3>
              <p className="text-purple-200 text-base sm:text-lg lg:text-xl max-w-md sm:max-w-lg mx-auto">
                ou clique para selecionar um arquivo do seu computador
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-sm sm:text-base text-purple-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>Suporta arquivos .csv</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500" />
                  <span>Até 10MB</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-1000" />
                  <span>Validação automática</span>
                </div>
              </div>
            </div>
            
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            
            <label
              htmlFor="file-upload"
              className="inline-flex items-center space-x-2 sm:space-x-3 lg:space-x-4 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 mt-6 sm:mt-8 lg:mt-10 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl sm:rounded-2xl lg:rounded-3xl cursor-pointer shadow-xl sm:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              <span>Selecionar arquivo</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl sm:max-w-3xl mx-auto">
          <div className="p-6 sm:p-8 lg:p-10 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl sm:shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{selectedFile.name}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 mt-2 sm:mt-3 text-purple-200">
                    <span className="flex items-center space-x-1 sm:space-x-2">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base lg:text-lg">{formatFileSize(selectedFile.size)}</span>
                    </span>
                    <span className="flex items-center space-x-1 sm:space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm sm:text-base lg:text-lg">Arquivo CSV</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={onFileRemove}
                className="p-3 sm:p-4 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 rounded-xl sm:rounded-2xl transition-all duration-300 border border-red-500/20 hover:border-red-500/40 hover:shadow-xl self-start sm:self-auto"
                disabled={isUploading}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

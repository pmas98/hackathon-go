import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, Download, Sparkles, FileText, Clock, Zap, Shield, TrendingUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { UploadArea } from '@/components/UploadArea';
import { useCsvValidation } from '@/lib/useCsvValidation';
import { api } from '@/lib/api';
import { cn, formatTime } from '@/lib/utils';

export default function HomeUpload() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadStartTimeRef = useRef<number>(0);

  const {
    validationResult,
    isValidationInProgress,
    validationProgress,
    validateFile,
    resetValidation,
    downloadErrorCSV
  } = useCsvValidation();

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    resetValidation();
    await validateFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadError(null);
    resetValidation();
  };

  const handleUpload = async () => {
    if (!selectedFile || !validationResult?.isValid) return;

    try {
      setIsUploading(true);
      setUploadError(null);
      uploadStartTimeRef.current = performance.now();

      const { job_id } = await api.uploadFile(selectedFile);
      
      navigate(`/job/${job_id}`);
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadError(
        error instanceof Error ? error.message : 'Erro desconhecido no upload'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = selectedFile && validationResult?.isValid && !isValidationInProgress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main Nebula */}
        <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-br from-pink-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating Stars */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300/60 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300/50 rounded-full animate-ping delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-purple-300/40 rounded-full animate-ping delay-1500"></div>
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-pink-300/50 rounded-full animate-ping delay-3000"></div>
        
        {/* Cosmic Dust */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional Nebula Layers */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-500/5 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-pink-500/5 via-transparent to-transparent"></div>
      </div>

      <Header />
      
      <main className="relative z-10 container mx-auto py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-8 sm:space-y-10">
            <div className="inline-flex items-center space-x-2 sm:space-x-4 px-4 sm:px-8 py-2 sm:py-4 bg-white/5 backdrop-blur-sm text-white rounded-full text-xs sm:text-sm font-medium border border-white/10 shadow-2xl">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse" />
              <span>Data Integrity Platform</span>
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse" />
            </div>
            
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent leading-tight">
                BIX Data Integrity
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-100 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed px-4">
                Valide e compare seus dados CSV com a API de produtos de forma 
                <span className="text-yellow-300 font-bold"> inteligente</span> e 
                <span className="text-yellow-300 font-bold"> eficiente</span>
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16">
              <div className="group p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Validação Inteligente</h3>
                <p className="text-purple-200 text-sm sm:text-base">Verificação automática de integridade dos dados</p>
              </div>
              
              <div className="group p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Comparação em Tempo Real</h3>
                <p className="text-purple-200 text-sm sm:text-base">Análise instantânea entre CSV e API</p>
              </div>
              
              <div className="group p-6 sm:p-8 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Relatórios Detalhados</h3>
                <p className="text-purple-200 text-sm sm:text-base">Exportação e visualização avançada</p>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-8 sm:space-y-10">
            <div className="text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Upload do Arquivo</h2>
              <p className="text-purple-200 text-base sm:text-lg lg:text-xl">Selecione ou arraste seu arquivo CSV para começar</p>
            </div>
            <UploadArea
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onFileRemove={handleFileRemove}
              isUploading={isUploading}
            />
          </div>

          {/* Validation Section */}
          {selectedFile && (
            <div className="space-y-8 sm:space-y-10">
              <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Validação</h2>
                <p className="text-purple-200 text-base sm:text-lg lg:text-xl">Verificando a integridade dos seus dados</p>
              </div>
              
              {isValidationInProgress && (
                <div className="max-w-2xl mx-auto">
                  <div className="p-6 sm:p-8 lg:p-10 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl sm:shadow-2xl">
                    <div className="space-y-6 sm:space-y-8">
                      <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-purple-400"></div>
                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Validando arquivo...</span>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between text-sm sm:text-lg text-purple-200">
                          <span>Progresso</span>
                          <span className="font-bold">{Math.round(validationProgress * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 sm:h-4 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 sm:h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                            style={{ width: `${validationProgress * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {validationResult && (
                <div className="max-w-4xl sm:max-w-5xl mx-auto">
                  <div className="p-6 sm:p-8 lg:p-10 bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl sm:shadow-2xl">
                    <div className="space-y-8 sm:space-y-10">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        {validationResult.isValid ? (
                          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
                            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl">
                            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                            {validationResult.isValid ? 'Validação Aprovada' : 'Validação com Erros'}
                          </h3>
                          <p className="text-purple-200 mt-1 sm:mt-2 text-sm sm:text-lg">
                            <Clock className="inline h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Tempo de validação: {formatTime(validationResult.validationTime)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        <div className="text-center p-4 sm:p-6 lg:p-8 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10">
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">{validationResult.totalLines}</div>
                          <div className="text-purple-200 text-sm sm:text-lg">Total de linhas</div>
                        </div>
                        <div className="text-center p-4 sm:p-6 lg:p-8 bg-green-500/10 rounded-xl sm:rounded-2xl border border-green-500/20">
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-2 sm:mb-3">{validationResult.validLines}</div>
                          <div className="text-green-200 text-sm sm:text-lg">Linhas válidas</div>
                        </div>
                        <div className="text-center p-4 sm:p-6 lg:p-8 bg-red-500/10 rounded-xl sm:rounded-2xl border border-red-500/20">
                          <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-400 mb-2 sm:mb-3">{validationResult.invalidLines}</div>
                          <div className="text-red-200 text-sm sm:text-lg">Linhas com erro</div>
                        </div>
                      </div>

                      {!validationResult.isValid && (
                        <div className="space-y-6 sm:space-y-8">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Erros encontrados:</h4>
                            <button
                              onClick={downloadErrorCSV}
                              className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 border border-white/20 hover:shadow-xl"
                            >
                              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                              <span className="text-sm sm:text-base">Baixar CSV com erros</span>
                            </button>
                          </div>
                          
                          <div className="max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto border border-white/10 rounded-xl sm:rounded-2xl bg-white/5">
                            <table className="w-full">
                              <thead className="bg-white/10 sticky top-0">
                                <tr>
                                  <th className="text-left p-3 sm:p-4 lg:p-6 text-sm sm:text-lg font-bold text-white">Linha</th>
                                  <th className="text-left p-3 sm:p-4 lg:p-6 text-sm sm:text-lg font-bold text-white">Campo</th>
                                  <th className="text-left p-3 sm:p-4 lg:p-6 text-sm sm:text-lg font-bold text-white">Valor</th>
                                  <th className="text-left p-3 sm:p-4 lg:p-6 text-sm sm:text-lg font-bold text-white">Motivo</th>
                                </tr>
                              </thead>
                              <tbody>
                                {validationResult.errors.slice(0, 50).map((error, index) => (
                                  <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                                    <td className="p-3 sm:p-4 lg:p-6 text-sm sm:text-lg font-bold text-white">{error.line}</td>
                                    <td className="p-3 sm:p-4 lg:p-6 text-sm sm:text-lg font-bold text-white">{error.field}</td>
                                    <td className="p-3 sm:p-4 lg:p-6 text-sm sm:text-lg text-purple-200">{error.value}</td>
                                    <td className="p-3 sm:p-4 lg:p-6 text-sm sm:text-lg text-red-300">{error.reason}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {validationResult.errors.length > 50 && (
                              <div className="p-3 sm:p-4 lg:p-6 text-sm sm:text-lg text-purple-200 text-center bg-white/5">
                                ... e mais {validationResult.errors.length - 50} erros
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <div className="flex justify-center">
              <button
                onClick={handleUpload}
                disabled={!canUpload || isUploading}
                className={cn(
                  "px-8 sm:px-12 lg:px-16 py-4 sm:py-6 lg:py-8 text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                  !canUpload && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? (
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8" />
                    <span>Enviar para Comparação</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="max-w-2xl mx-auto">
              <div className="p-6 sm:p-8 bg-red-500/10 border border-red-500/20 rounded-2xl sm:rounded-3xl backdrop-blur-sm">
                <div className="flex items-center space-x-3 sm:space-x-4 text-red-300">
                  <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                  <span className="font-bold text-lg sm:text-xl">Erro no Upload</span>
                </div>
                <p className="text-red-200 mt-3 sm:mt-4 text-sm sm:text-lg">{uploadError}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Upload, Sparkles, Zap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={cn("sticky top-0 z-50 w-full bg-transparent backdrop-blur-md border-b border-white/10", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4 group">
              <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500 group-hover:scale-110 border border-white/20">
                <div className="relative">
                  <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" />
                  <Zap className="absolute -top-1 -right-1 sm:-top-1 sm:-right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-300 animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                  BIX Data Integrity
                </span>
                <span className="text-xs sm:text-xs text-purple-200 -mt-1 font-medium hidden sm:block">Data Quality Platform</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <Link 
              to="/" 
              className={cn(
                "flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-sm font-medium transition-all duration-500 relative overflow-hidden group",
                isActive('/') 
                  ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-xl lg:shadow-2xl shadow-purple-500/25 border border-white/20" 
                  : "text-purple-200 hover:text-white hover:bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
              <Upload className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Upload</span>
            </Link>
            <Link 
              to="/jobs" 
              className={cn(
                "flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-sm font-medium transition-all duration-500 relative overflow-hidden group",
                isActive('/jobs') 
                  ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-xl lg:shadow-2xl shadow-purple-500/25 border border-white/20" 
                  : "text-purple-200 hover:text-white hover:bg-white/5 backdrop-blur-sm border border-transparent hover:border-white/10"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
              <BarChart3 className="h-4 w-4 relative z-10" />
              <span className="relative z-10">Histórico</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-purple-200 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive('/') 
                    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg border border-white/20" 
                    : "text-purple-200 hover:text-white hover:bg-white/5"
                )}
              >
                <Upload className="h-5 w-5" />
                <span>Upload</span>
              </Link>
              <Link 
                to="/jobs" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive('/jobs') 
                    ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-lg border border-white/20" 
                    : "text-purple-200 hover:text-white hover:bg-white/5"
                )}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Histórico</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

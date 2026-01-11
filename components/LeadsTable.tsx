import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { MapPin, Globe, Star, AlertCircle, ExternalLink, Map as MapIcon, ChevronDown, ChevronUp, Search, CheckCircle2, ChevronLeft, ChevronRight, Zap, Lightbulb, Mail, Copy, Check, Phone, ArrowUpRight } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const ITEMS_PER_PAGE = 8;

  // Reset to first page when new leads are fetched
  useEffect(() => {
    setCurrentPage(1);
    setExpandedMapId(null);
    setExpandedEmailId(null);
  }, [leads]);

  const toggleMap = (id: string) => {
    setExpandedMapId(expandedMapId === id ? null : id);
    if (expandedEmailId === id) setExpandedEmailId(null); // Close email if map opens
  };

  const toggleEmail = (id: string) => {
    setExpandedEmailId(expandedEmailId === id ? null : id);
    if (expandedMapId === id) setExpandedMapId(null); // Close map if email opens
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of list, considering mobile header offset
    const listElement = document.getElementById('results-top');
    if (listElement) {
        listElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel rounded-xl p-4 sm:p-6 animate-pulse">
            <div className="h-6 bg-glass-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-glass-100 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-glass-100 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-8 sm:p-12 text-center text-gray-400">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-glass-300" />
        </div>
        <p className="text-base sm:text-lg">No leads found matching your strict criteria.</p>
        <p className="text-xs sm:text-sm opacity-60">Try a different category or location. We filtered out businesses that already have websites.</p>
      </div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="w-full space-y-4 sm:space-y-6" id="results-top">
      <div className="grid gap-3 sm:gap-4">
        {currentLeads.map((lead) => {
          const isMapOpen = expandedMapId === lead.id;
          const isEmailOpen = expandedEmailId === lead.id;
          
          // Maps query
          const mapSearchQuery = encodeURIComponent(`${lead.name} ${lead.address}`);
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;
          
          // Google Search query (for verifying website status)
          const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${lead.name} ${lead.address} official website`)}`;
          
          return (
            <div 
              key={lead.id} 
              className={`glass-panel rounded-xl transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary-500 overflow-hidden ${isMapOpen || isEmailOpen ? 'bg-glass-200' : ''}`}
            >
              {/* Reduced padding for mobile p-4 vs p-6 */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    {/* Header: Name and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">
                        {lead.name}
                      </h3>
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Open
                      </span>
                    </div>
                    
                    {/* Address & Contact Info */}
                    <div className="space-y-1.5">
                        <div className="flex items-start text-gray-300 gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                        <span className="leading-snug opacity-90">{lead.address}</span>
                        </div>
                        
                        {(lead.phone || lead.email) && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 pl-6">
                                {lead.phone && (
                                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-blue-200 transition-colors">
                                        <Phone className="w-3 h-3" />
                                        {lead.phone}
                                    </a>
                                )}
                                {lead.email && (
                                    <span className="flex items-center gap-1.5 text-xs text-indigo-300">
                                        <Mail className="w-3 h-3" />
                                        {lead.email}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap pt-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-white">{lead.rating}</span>
                        <span className="opacity-60 text-xs">({lead.user_ratings_total})</span>
                      </div>
                      
                      {/* Explicit Lead Opportunity Indicator */}
                      <div className="flex items-center gap-1 text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-xs sm:text-sm font-medium">
                        <Zap className="w-3 h-3" />
                        <span>High Potential Lead</span>
                      </div>
                    </div>

                    {/* AI Recommendation Section */}
                    {lead.suggested_solution && (
                        <div className="mt-3 p-3 rounded-lg bg-indigo-900/20 border border-indigo-500/20">
                            <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 p-1 bg-indigo-500/20 rounded-md shrink-0">
                                    <Lightbulb className="w-3.5 h-3.5 text-indigo-300" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-indigo-200">
                                        Suggest: {lead.suggested_solution}
                                    </h4>
                                    <p className="text-xs text-indigo-300/80 mt-1 leading-relaxed">
                                        {lead.suggestion_reason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                  </div>

                  {/* Action Buttons - Right side on desktop, bottom on mobile */}
                  <div className="flex flex-col gap-2 shrink-0 md:w-auto w-full pt-2 md:pt-0">
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => toggleEmail(lead.id)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium border border-glass-300 active:scale-95 ${isEmailOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-glass-200 hover:bg-glass-300 text-gray-200'}`}
                        title="Generate Email Pitch"
                      >
                         <Mail className="w-4 h-4" />
                         {isEmailOpen ? 'Close' : 'Pitch'}
                      </button>

                      <button 
                        onClick={() => toggleMap(lead.id)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium border border-glass-300 active:scale-95 ${isMapOpen ? 'bg-primary-600 border-primary-500 text-white' : 'bg-glass-200 hover:bg-glass-300 text-gray-200'}`}
                      >
                        {isMapOpen ? 'Close' : 'Map'}
                        {isMapOpen ? <ChevronUp className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
                      </button>
                      
                      <a 
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2.5 bg-glass-200 hover:bg-glass-300 active:scale-95 text-white rounded-lg transition-colors text-sm font-medium border border-glass-300"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <a 
                        href={googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2.5 bg-glass-200 hover:bg-glass-300 active:scale-95 text-white rounded-lg transition-colors text-sm font-medium border border-glass-300"
                        title="Search web"
                      >
                        <Search className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Draft Section */}
              {isEmailOpen && lead.email_draft_subject && (
                <div className="w-full bg-black/40 border-t border-glass-200 animate-in fade-in slide-in-from-top-2 duration-300 p-4 sm:p-6">
                  <div className="bg-glass-100 rounded-lg p-4 border border-glass-200 relative">
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                        <div className="space-y-1 w-full">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Subject</span>
                            <div className="text-sm sm:text-base font-medium text-white">{lead.email_draft_subject}</div>
                            {lead.email && (
                                <div className="text-xs text-indigo-300 mt-1 flex items-center gap-1">
                                    To: {lead.email}
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-2 self-end sm:self-start">
                            {lead.email && (
                                <a 
                                  href={`mailto:${lead.email}?subject=${encodeURIComponent(lead.email_draft_subject)}&body=${encodeURIComponent(lead.email_draft_body || '')}`}
                                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium text-white transition-colors"
                                >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    Send via App
                                </a>
                            )}
                            <button 
                               onClick={() => copyToClipboard(`${lead.email_draft_subject}\n\n${lead.email_draft_body}`, lead.id)}
                               className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-glass-300 hover:bg-glass-400 rounded-lg text-xs font-medium text-gray-200 transition-colors"
                            >
                                {copiedId === lead.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedId === lead.id ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                     </div>
                     <div className="w-full h-px bg-glass-200 mb-4" />
                     <div className="space-y-1">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Body</span>
                        <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-light">
                            {lead.email_draft_body}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* Embedded Map Section */}
              {isMapOpen && (
                <div className="w-full h-64 bg-black/50 border-t border-glass-200 animate-in fade-in zoom-in-95 duration-300 relative group">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(lead.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="filter grayscale-[20%] invert-[85%] hue-rotate-180 contrast-[1.2]"
                    title={`Map location of ${lead.name}`}
                  ></iframe>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Controls - Improved touch targets */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4 bg-glass-100 rounded-xl backdrop-blur-md border border-glass-200">
           <button
             onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
             disabled={currentPage === 1}
             className="p-3 rounded-lg bg-glass-200 hover:bg-glass-300 disabled:opacity-30 disabled:hover:bg-glass-200 disabled:cursor-not-allowed transition-colors text-white active:scale-95"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           
           <div className="flex items-center gap-2 text-sm font-medium">
             <span className="text-gray-400">Page</span>
             <span className="bg-primary-600 text-white px-3 py-1 rounded-md min-w-[2rem] text-center">{currentPage}</span>
             <span className="text-gray-400">of {totalPages}</span>
           </div>

           <button
             onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
             disabled={currentPage === totalPages}
             className="p-3 rounded-lg bg-glass-200 hover:bg-glass-300 disabled:opacity-30 disabled:hover:bg-glass-200 disabled:cursor-not-allowed transition-colors text-white active:scale-95"
           >
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      )}
    </div>
  );
};
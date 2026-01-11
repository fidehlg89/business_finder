import React, { useState, useTransition } from 'react';
import { Search, MapPin, Loader2, Sparkles, Filter } from 'lucide-react';
import { findLeadsAction } from './services/leads';
import { LeadsTable } from './components/LeadsTable';
import { Lead, CategoryOption } from './types';

export default function App() {
  // Using useTransition to mimic React 19's useActionState/useFormStatus pattern client-side
  const [isPending, startTransition] = useTransition();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  
  // Form State - Default generic to encourage specific city search
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<CategoryOption | 'all'>('restaurant');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback for empty location if user clicks search immediately
    const searchLoc = location.trim() || 'Portugal';
    
    // Start the "Server Action" transition
    startTransition(async () => {
      try {
        const results = await findLeadsAction(category, searchLoc);
        setLeads(results);
        
        // Scroll to results on mobile after search
        setTimeout(() => {
            const resultsEl = document.getElementById('results-section');
            if (resultsEl) {
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
      } catch (error) {
        console.error("Failed to fetch leads", error);
      }
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a]">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[60%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        {/* Header - Compact on mobile */}
        <div className="text-center mb-8 sm:mb-16 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-glass-100 border border-glass-300 text-primary-400 text-xs sm:text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>AI-Powered Lead Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 leading-tight">
            Web potential business finder
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 px-2">
            Find operational businesses across <span className="text-white font-semibold">Portugal</span> that are missing a digital presence.
          </p>
        </div>

        {/* Search Engine Interface - Mobile Optimized */}
        <div className="max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="glass-panel p-2 rounded-2xl shadow-2xl shadow-black/50">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              
              {/* Location Input */}
              <div className="relative flex-1 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                {/* text-base prevents iOS zoom on focus */}
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 pl-12 pr-4 py-3 sm:py-4 rounded-xl outline-none text-base"
                  placeholder="Enter city (e.g., Porto)..."
                />
              </div>

              <div className="w-px h-10 bg-glass-200 self-center hidden md:block" />

              {/* Category Select */}
              <div className="relative md:w-48 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-500 transition-colors">
                  <Filter className="w-5 h-5" />
                </div>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-transparent text-white focus:ring-0 pl-12 pr-8 py-3 sm:py-4 rounded-xl appearance-none outline-none cursor-pointer [&>option]:bg-[#1e293b] text-base"
                >
                  <option value="all">All Categories</option>
                  <option value="restaurant">Restaurants</option>
                  <option value="cafe">Cafes</option>
                  <option value="bakery">Bakeries</option>
                  <option value="clothing_store">Retail</option>
                  <option value="gym">Wellness</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isPending}
                className={`
                  flex items-center justify-center gap-2 px-8 py-3 sm:py-4 rounded-xl text-white font-bold text-base sm:text-lg transition-all duration-300
                  ${isPending 
                    ? 'bg-glass-200 cursor-not-allowed opacity-80' 
                    : 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/30 active:scale-95'
                  }
                `}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="md:inline">Scanning</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Find</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div id="results-section" className="max-w-4xl mx-auto scroll-mt-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              Results
              {leads && (
                <span className="text-xs sm:text-sm font-normal text-gray-400 bg-glass-200 px-2 py-1 rounded-md">
                  {leads.length} found
                </span>
              )}
            </h2>
          </div>
          
          {(leads || isPending) && <LeadsTable leads={leads || []} isLoading={isPending} />}
          
          {!leads && !isPending && (
             <div className="text-center mt-8 sm:mt-12 opacity-50">
               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-glass-100 rounded-full mx-auto flex items-center justify-center mb-4">
                 <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
               </div>
               <p className="text-sm sm:text-base text-gray-400">Enter a location to start scouting.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
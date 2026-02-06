import { useState } from 'react';
import { Spinner } from "../components/ui/spinner.jsx";
import { Input } from '../components/ui/input.js';
import { Button } from '../components/ui/button.js'; 
import { Search } from 'lucide-react';

function SearchPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) 
      return;
    
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Spinner letterSpacing={3} />
          <p className="text-sm text-muted-foreground animate-pulse">Searching the sources...</p>
        </div>
      ) : (
        <div className="w-full max-w-2xl transition-all duration-300 ease-in-out">
          <h1 className="mb-8 text-4xl font-bold text-center tracking-tight">What are disease are you searching ?</h1>
          
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <Input 
              className="pl-12 pr-24 h-14 text-lg rounded-2xl shadow-sm focus-visible:ring-2"
              placeholder="Search documentation, components, or guides..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl"
              variant="ghost"
            >
              Search
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
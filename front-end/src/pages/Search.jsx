import React, { useState } from 'react';
import { Spinner } from "../components/ui/spinner.jsx";
import { Input } from '../components/ui/input.js';
import { Search } from 'lucide-react';

function SearchPage() {
  const [isLoading, _setisLoading] = useState(false);


  return (
    <div className="flex items-center justify-center h-[60vh]">
      {isLoading ? <Spinner letterSpacing={3} /> : <div>
        <Input />
        <Search/>Search
      </div>}
    </div>
  )
}

export default SearchPage
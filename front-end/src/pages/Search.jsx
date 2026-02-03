import React, { useState } from 'react';
import { Spinner } from "../components/ui/spinner.jsx"

function Search() {
  const [isLoading, _setisLoading] = useState(false);


  return (
    <div className="flex items-center justify-center h-[60vh]">
      {isLoading ? <Spinner/> : <div>Search</div>}
    </div>
  )
}

export default Search
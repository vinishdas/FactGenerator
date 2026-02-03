import { useState } from "react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, } from "../components/ui/empty.jsx";
import { FileArchive } from "lucide-react";

function HomePage() {
  const [isEmpty, _setIsEmpty] = useState(true);
  return (
    <>
      <div className="flex items-center justify-center h-[60vh]">
        {isEmpty ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileArchive className="h-8 w-8" />
              </EmptyMedia>

              <EmptyTitle>No Projects Yet</EmptyTitle>

              <EmptyDescription>
                You don't have any active posts yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div>Home</div>
        )}
      </div>
    </>
  )
}

export default HomePage
/**
 * LoadingSkeleton Component
 * Displays an animated loading state for the conversation detail page
 */
export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f4] via-[#e6f5ec] to-[#d8eee1]">
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
          <div className="h-8 w-64 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-card rounded-lg border shadow-sm h-[50rem] animate-pulse" />
          <div className="bg-card rounded-lg border shadow-sm h-[50rem] animate-pulse" />
          <div className="bg-card rounded-lg border shadow-sm h-[50rem] animate-pulse" />
        </div>
      </div>
    </div>
  )
} 
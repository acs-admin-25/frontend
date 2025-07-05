import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSplineScene } from '@/hooks/useSplineScene';
import { isValidSplineUrl } from '@/lib/utils/spline';

interface SplineUrlUpdaterProps {
  initialUrl?: string;
  onUrlChange?: (newUrl: string) => void;
  className?: string;
}

/**
 * SplineUrlUpdater Component
 * 
 * A development/debugging component that allows manual updating of Spline URLs
 * and provides cache clearing and refresh functionality.
 */
export function SplineUrlUpdater({ 
  initialUrl, 
  onUrlChange,
  className 
}: SplineUrlUpdaterProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl || '');
  const [isValid, setIsValid] = useState(true);
  
  const {
    refreshScene,
    updateUrl,
    forceRefresh,
    clearCache,
    isLoading,
    error
  } = useSplineScene({ initialUrl });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setInputUrl(newUrl);
    setIsValid(isValidSplineUrl(newUrl));
  };

  const handleUpdateUrl = () => {
    if (!isValid) return;
    
    updateUrl(inputUrl);
    onUrlChange?.(inputUrl);
  };

  const handleForceRefresh = () => {
    forceRefresh();
  };

  const handleClearCache = () => {
    clearCache();
  };

  return (
    <div className={`space-y-4 p-4 border rounded-lg bg-gray-50 ${className}`}>
      <h3 className="text-lg font-semibold">Spline URL Manager</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Spline URL:</label>
        <div className="flex gap-2">
          <Input
            type="url"
            value={inputUrl}
            onChange={handleUrlChange}
            placeholder="https://prod.spline.design/..."
            className={!isValid && inputUrl ? 'border-red-500' : ''}
          />
          <Button 
            onClick={handleUpdateUrl}
            disabled={!isValid || !inputUrl}
            size="sm"
          >
            Update
          </Button>
        </div>
        {!isValid && inputUrl && (
          <p className="text-red-500 text-xs">Invalid Spline URL format</p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={handleForceRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? 'Refreshing...' : 'Force Refresh'}
        </Button>
        
        <Button 
          onClick={handleClearCache}
          variant="outline"
          size="sm"
        >
          Clear Cache
        </Button>
        
        <Button 
          onClick={refreshScene}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          Refresh Scene
        </Button>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error}
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>Current URL: {initialUrl || 'None'}</p>
        <p>Status: {isLoading ? 'Loading...' : 'Ready'}</p>
      </div>
    </div>
  );
} 
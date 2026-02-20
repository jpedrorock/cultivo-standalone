import { Loader2 } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  isReadyToRefresh: boolean;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  isReadyToRefresh,
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  const rotation = Math.min((pullDistance / 80) * 360, 360);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        transform: `translateY(${Math.min(pullDistance, 80)}px)`,
        transition: isRefreshing ? 'transform 0.3s ease' : 'none',
      }}
    >
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full p-3 shadow-lg">
        {isRefreshing ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <svg
            className="w-6 h-6 text-primary"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.1s ease',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        )}
      </div>
      {!isRefreshing && (
        <div className="absolute -bottom-8 text-xs text-muted-foreground">
          {isReadyToRefresh ? 'Solte para atualizar' : 'Puxe para atualizar'}
        </div>
      )}
    </div>
  );
}

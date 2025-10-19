import type { MapPopupProps } from '@/lib/map-types';

export function MapPopup({ children }: MapPopupProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px] relative">
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
      {children}
    </div>
  );
}

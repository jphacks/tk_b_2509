// マップ関連の型定義
export interface MapPin {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  content?: React.ReactNode;
}

export interface GoogleMapProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  pins?: MapPin[];
}

export interface MapPopupProps {
  children?: React.ReactNode;
}

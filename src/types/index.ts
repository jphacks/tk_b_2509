export interface User {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
}

export interface Spot {
  id: string;
  name: string;
  category: 'cafe' | 'park' | 'library' | 'coworking' | 'beach' | 'other';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description?: string;
  amenities: string[];
  averageRating: number;
  totalReviews: number;
}

export interface Review {
  id: string;
  userId: string;
  user: User;
  spotId: string;
  spot: Spot;
  rating: number;
  content: string;
  mood: 'productive' | 'relaxed' | 'creative' | 'focused' | 'social';
  tags: string[];
  visitDate: Date;
  createdAt: Date;
  helpful: number;
  images?: string[];
}

export interface ReviewFormData {
  spotId: string;
  rating: number;
  content: string;
  mood: Review['mood'];
  tags: string[];
  visitDate: Date;
}

export interface MapViewport {
  center: [number, number];
  zoom: number;
}

export interface FilterOptions {
  categories: Spot['category'][];
  minRating: number;
  moods: Review['mood'][];
  sortBy: 'recent' | 'rating' | 'helpful';
}

export type NotificationType = 'review_visit' | 'helpful_review' | 'new_spot';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  userId: string;
  relatedReviewId?: string;
  relatedSpotId?: string;
  isRead: boolean;
  createdAt: Date;
}

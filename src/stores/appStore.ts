import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Spot, Review, FilterOptions, MapViewport, User } from '@/types';
import { mockSpots, mockReviews, mockUsers } from '@/data/mockData';

interface AppState {
  // データ
  spots: Spot[];
  reviews: Review[];
  users: User[];
  currentUser: User | null;

  // UI状態
  selectedSpot: Spot | null;
  mapViewport: MapViewport;
  filters: FilterOptions;
  isLoading: boolean;
  error: string | null;

  // アクション
  setSpots: (spots: Spot[]) => void;
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;
  setSelectedSpot: (spot: Spot | null) => void;
  setMapViewport: (viewport: MapViewport) => void;
  setFilters: (filters: Partial<FilterOptions>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 計算済み値
  getFilteredSpots: () => Spot[];
  getReviewsForSpot: (spotId: string) => Review[];
  getRecommendedSpots: (limit?: number) => Spot[];
}

const defaultViewport: MapViewport = {
  center: [35.6580, 139.7016], // 渋谷周辺
  zoom: 13,
};

const defaultFilters: FilterOptions = {
  categories: [],
  minRating: 0,
  moods: [],
  sortBy: 'recent',
};

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // 初期状態
      spots: mockSpots,
      reviews: mockReviews,
      users: mockUsers,
      currentUser: mockUsers[0], // 開発時は最初のユーザーを現在のユーザーとして設定

      selectedSpot: null,
      mapViewport: defaultViewport,
      filters: defaultFilters,
      isLoading: false,
      error: null,

      // アクション
      setSpots: (spots) => set({ spots }, false, 'setSpots'),
      setReviews: (reviews) => set({ reviews }, false, 'setReviews'),
      addReview: (review) =>
        set(
          (state) => ({
            reviews: [review, ...state.reviews],
          }),
          false,
          'addReview'
        ),

      setSelectedSpot: (spot) => set({ selectedSpot: spot }, false, 'setSelectedSpot'),
      setMapViewport: (viewport) => set({ mapViewport: viewport }, false, 'setMapViewport'),
      setFilters: (newFilters) =>
        set(
          (state) => ({
            filters: { ...state.filters, ...newFilters },
          }),
          false,
          'setFilters'
        ),

      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),

      // 計算済み値
      getFilteredSpots: () => {
        const { spots, filters } = get();
        let filtered = [...spots];

        // カテゴリーフィルター
        if (filters.categories.length > 0) {
          filtered = filtered.filter((spot) => filters.categories.includes(spot.category));
        }

        // レーティングフィルター
        if (filters.minRating > 0) {
          filtered = filtered.filter((spot) => spot.averageRating >= filters.minRating);
        }

        // ソート
        switch (filters.sortBy) {
          case 'rating':
            filtered.sort((a, b) => b.averageRating - a.averageRating);
            break;
          case 'recent':
            filtered.sort((a, b) => b.totalReviews - a.totalReviews);
            break;
          case 'helpful':
            // レビュー数が多い順（人気順）
            filtered.sort((a, b) => b.totalReviews - a.totalReviews);
            break;
        }

        return filtered;
      },

      getReviewsForSpot: (spotId) => {
        const { reviews } = get();
        return reviews
          .filter((review) => review.spotId === spotId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },

      getRecommendedSpots: (limit = 3) => {
        const { spots, currentUser } = get();
        if (!currentUser) return spots.slice(0, limit);

        // シンプルなレコメンデーションアルゴリズム
        // 評価の高いスポットを優先的に表示
        return spots
          .filter((spot) => spot.averageRating >= 4.0)
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, limit);
      },
    }),
    {
      name: 'workscape-store',
    }
  )
);

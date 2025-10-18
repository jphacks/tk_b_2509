import type { MoodType } from "@/lib/post-types";

export type Mood = MoodType;

export interface PostFormData {
  placeId: string | null;
  spotName: string;
  mood: Mood | null;
  text: string;
  image: File | null;
}

export interface PlaceOption {
  id: string;
  name: string;
}

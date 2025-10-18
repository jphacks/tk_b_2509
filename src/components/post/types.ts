export type Mood = "relax" | "focus" | "idea" | "chat";

export interface PostFormData {
  spotName: string;
  mood: Mood | null;
  text: string;
  image: File | null;
}

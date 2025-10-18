import { ReviewCard } from "@/components/post/ReviewCard";

export default function Feed(){
  return (
    <>
    <ReviewCard placeName="東大の誰も知らない場所"
    badgeUrl="/path/to/badge.png"
    reviewText="この場所は本当に素晴らしいです！"
    imageUrl="/path/to/image.png"
    reactionCount={10}
    userAvatarUrl="/path/to/user-avatar.png"
    userAvatarFallback="田中"
    username="田中"
    />
    </>
  );
}

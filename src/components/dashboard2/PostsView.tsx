"use client";

import { Prospect } from "@/types/brand";
import RedditEngageSection from "./RedditEngageSection";

interface PostsViewProps {
  prospect: Prospect;
  brandId: string;
}

export default function PostsView({ prospect, brandId }: PostsViewProps) {
  return (
    <div className="posts-view-container">
      <RedditEngageSection
        selectedProblem={prospect}
        brandId={brandId}
      />
    </div>
  );
}
// "use client";

// import { useState, useEffect } from "react";
// import type { RedditPost } from "@/types/brand";
// import AgentReplyBox from "./AgentReplyBox";
// import GlassPanel from "@/components/ui/GlassPanel";
// import { useBrand } from "@/contexts/BrandContext";
// import { useProfile } from "@/contexts/ProfileContext";
// import { useProspectPostAction } from "@/hooks/api/useProspectPostAction";
// import {
//   RedditPostHeader,
//   RedditPostTitle,
//   RedditPostContent,
//   RedditStatBadges,
// } from "./RedditItemCommon";

// interface RedditPostListItemProps {
//   post: RedditPost;
//   onIgnore?: (post: RedditPost) => Promise<void>;
// }

// // Agents will be used for reply generation instead of personas

// export default function RedditPostListItem({
//   post,
//   onIgnore,
// }: RedditPostListItemProps) {
//   // Get brand data from context
//   const { brand } = useBrand();
//   // Get profile data from context
//   const { activeConvoId, prospectProfileId } = useProfile();
//   // Get the post action mutation
//   const postActionMutation = useProspectPostAction();

//   // Derived fields
//   const postId = post.thing_id;
//   const postTitle = post.title || "";
//   const postContent = post.content;
//   const postAuthor = post.author;
//   const postSubreddit = post.subreddit;
//   const postLink = `https://reddit.com${post.permalink}`;
//   const postCreatedAt = new Date(post.created_utc * 1000).toISOString();
//   const postUpVotes = post.upvotes || post.score || 0;
//   const postNumComments = post.reply_count || 0;
//   const llmExplanation = post.suggested_agent_reply || "";

//   // Check if this is a RedditPost with suggested_agent_reply
//   const hasSuggestedReply = !!post.suggested_agent_reply;

//   const [isSubmittingAction, setIsSubmittingAction] = useState(false);
//   const [customReply, setCustomReply] = useState<string>(
//     post.suggested_agent_reply ?? ""
//   );
//   const [showReplyBox, setShowReplyBox] = useState(!!hasSuggestedReply);
//   const [replySent, setReplySent] = useState(false);

//   // Check if we're returning from Reddit auth for this specific post
//   useEffect(() => {
//     // Check URL hash for post ID
//     const hash = window.location.hash;
//     if (hash === `#post-${postId}`) {
//       // This is the post user was working on before redirect
//       // Check for saved draft
//       const draftKey: string = `reddit-reply-draft-${postId}`;
//       const draftData = sessionStorage.getItem(draftKey);

//       if (draftData) {
//         // Open reply box automatically
//         setShowReplyBox(true);

//         // Scroll to this post after a brief delay to ensure DOM is ready
//         setTimeout(() => {
//           const element = document.getElementById(`post-${postId}`);
//           if (element) {
//             element.scrollIntoView({ behavior: "smooth", block: "center" });
//           }
//         }, 100);

//         // Clear the hash after handling
//         window.history.replaceState(
//           null,
//           "",
//           window.location.pathname + window.location.search
//         );
//       }
//     }
//   }, [postId]);
//   // const postStatus = post.status;

//   // Extract mentioned brand from llm_explanation
//   const mentionedBrand = llmExplanation
//     ?.match(
//       /(?:mentions?|discusses?|talks? about)\s+([A-Za-z0-9\s]+?)(?:\s+(?:in|as|for|with|to|and|or|but|because|since|although|while|if|when|where|why|how|that|which|who|whom|whose)|\.|,|;|:|\?|!|$)/i
//     )?.[1]
//     ?.trim();


//   async function handleIgnore() {
//     setIsSubmittingAction(true);
//     try {
//       if (onIgnore) {
//         // Use custom onIgnore if provided
//         await onIgnore(post);
//       } else if (brand && prospectProfileId) {
//         // Otherwise use the built-in mutation
//         await postActionMutation.mutateAsync({
//           post,
//           action: "ignore",
//           brandId: brand.id,
//           brandName: brand.name,
//           brandDetail: brand.detail || undefined,
//           prospectId: prospectProfileId,
//           problem: brand.prospects?.[0]?.problem_to_solve, // You may need to adjust this based on your data structure
//         });
//       } else {
//         console.error("Missing required data for ignore action");
//         alert("Unable to ignore post. Missing brand or profile information.");
//       }
//     } catch (error) {
//       console.error("Error ignoring post:", error);
//       alert("Failed to ignore post. Please try again.");
//     } finally {
//       setIsSubmittingAction(false);
//     }
//   }

//   // Get truncated content for preview
//   const contentToShow = postContent || "";

//   return (
//     <div id={`post-${postId}`} className="group">
//       <div className="rounded-lg border border-[#343536] bg-[#1a1a1b] p-5 transition-colors duration-200 hover:border-[#4f5355]">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-4">
//           <div className="flex-1">
//             {/* Subreddit mention */}
//             <RedditPostHeader
//               subreddit={postSubreddit}
//               author={postAuthor}
//               createdAt={postCreatedAt}
//               mentionedBrand={mentionedBrand}
//             />

//             {/* Post title - Clickable */}
//             <RedditPostTitle title={postTitle} link={postLink} />

//             {/* Post Content - Collapsible */}
//             {contentToShow && <RedditPostContent content={contentToShow} />}

//             {/* Tags removed with SubredditPost deprecation */}

//             {/* Action bar with counters on the left */}
//             <div
//               className="flex items-center gap-3 pt-4 border-t border-white/10"
//               onClick={(e) => e.stopPropagation()}
//             >
//               {/* Left-aligned counters styled as badges */}
//               <RedditStatBadges upvotes={postUpVotes} comments={postNumComments} />

//               {/* Spacer to push actions to the right */}
//               <div className="ml-auto flex items-center gap-3">
//                 <GlassPanel
//                   as="button"
//                   onClick={() => {
//                     setShowReplyBox(!showReplyBox);
//                   }}
//                   disabled={isSubmittingAction}
//                   className="px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105"
//                   style={{
//                     background:
//                       "linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(16, 185, 129, 0.8))",
//                     color: "white",
//                     border: "1px solid rgba(34, 197, 94, 0.3)",
//                     boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)",
//                   }}
//                 >
//                   {showReplyBox ? "Cancel" : "Reply"}
//                 </GlassPanel>

//                 <GlassPanel
//                   as="button"
//                   onClick={handleIgnore}
//                   disabled={isSubmittingAction}
//                   className="px-4 py-2 rounded-xl font-body font-medium text-sm transition-all duration-300 hover:scale-105"
//                   variant="light"
//                   style={{
//                     color: "white",
//                     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
//                   }}
//                 >
//                   {isSubmittingAction ? "Processing..." : "Ignore"}
//                 </GlassPanel>
//               </div>
//             </div>

//             {/* Reply box - only show if we have the required context */}
//             {showReplyBox && (
//               <AgentReplyBox
//                 customReply={customReply}
//                 setCustomReply={setCustomReply}
//                 replySent={replySent}
//                 post={post}
//                 onClose={() => setShowReplyBox(false)}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

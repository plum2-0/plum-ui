// "use client";

// import {  useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import SwipeableProspectModal from "@/components/dashboard2/SwipeableProspectModal";
// import { useBrand } from "@/contexts/BrandContext";
// import { RedditPostUI } from "@/types/brand";

// export default function SwipePage() {
//   useSession();
//   const router = useRouter();
//   const { brand: brandData, postsToReview } = useBrand();

//   useEffect(() => {
//     if (brandData?.prospects) {
//       // Flatten all posts and attach prospect_id to each post
//       const allPosts: RedditPostUI[] = brandData.prospects.flatMap(
//         (prospect) =>
//           prospect.sourced_reddit_posts
//             .filter((post) => post.status === "PENDING")
//             .map((post) => ({
//               ...post,
//               prospect_id: prospect.id,
//             }))
//       );
//     }
//   }, [brandData]);

//   const handleStackCompleted = () => {
//     // Navigate back to dashboard when all posts are reviewed
//     router.push("/dashboard/engage");
//   };

//   const handleClose = () => {
//     // Navigate back to dashboard when user closes
//     router.push("/dashboard/engage");
//   };

//   if (!brandData) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-black">
//         <div className="text-white text-xl font-body">No brand data found</div>
//       </div>
//     );
//   }

//   if (postsToReview.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-black">
//         <div className="text-center">
//           <div className="text-white text-xl font-body mb-4">
//             No pending posts to review
//           </div>
//           <button
//             onClick={() => router.push("/dashboard/engage")}
//             className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black">
//       <SwipeableProspectModal
//         isOpen={true}
//         posts={postsToReview.map((post) => ({
//           ...post,
//           prospect_id: brandData.prospects[0].id,
//         }))}
//         brandId={brandData.id}
//         brandName={brandData.name}
//         brandDetail={brandData.detail || undefined}
//         onClose={handleClose}
//         onStackCompleted={handleStackCompleted}
//         standalone={true}
//       />
//     </div>
//   );
// }

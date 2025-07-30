import { RedditPostActionManager } from '@/components/reddit';

export default function ReviewPage({
  params
}: {
  params: Promise<{ projectId: string }>
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reddit Post Review
          </h1>
          <p className="text-gray-600 mt-2">
            Review and take action on posts matched by your AI configuration.
          </p>
        </div>

        {/* Main Content */}
        <RedditPostActionManagerWrapper params={params} />
      </div>
    </div>
  );
}

// Wrapper component to handle async params
async function RedditPostActionManagerWrapper({ 
  params 
}: { 
  params: Promise<{ projectId: string }> 
}) {
  const { projectId } = await params;
  
  return <RedditPostActionManager projectId={projectId} />;
}
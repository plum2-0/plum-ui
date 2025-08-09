import InviteClient from "./InviteClient";

export default function InvitePage({
  params
}: {
  params: Promise<{ token: string }>
}) {
  return <InviteClientWrapper params={params} />;
}

// Wrapper component to handle async params
async function InviteClientWrapper({ 
  params 
}: { 
  params: Promise<{ token: string }> 
}) {
  const { token } = await params;
  
  return <InviteClient token={token} />;
}

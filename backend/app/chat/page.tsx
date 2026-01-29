import { auth } from "@clerk/nextjs/server";
import Chat from "../components/chat";

export default async function App() {
  const {userId} = await auth()
  if (!userId) {
    return <div className="flex h-screen items-center justify-center p-4">User not authenticated.</div>;
  }
  return (
    <div className="flex h-screen items-center justify-center p-4">
      <Chat
        ragQueryUrl="http://localhost:8000/query"
        userId={userId}
      />
    </div>
  );
}

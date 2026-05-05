import { auth } from "@clerk/nextjs/server";
import { LandingPage } from "@/components/landing-page";

export default async function RootPage() {
  const { userId } = await auth();

  return <LandingPage userId={userId} />;
}

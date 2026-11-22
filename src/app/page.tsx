import type { Metadata } from "next";
import { WelcomePage } from "@/features/welcome/WelcomePage";

export const metadata: Metadata = { title: { absolute: "Welcome · DevDash" } };

export default function Page() {
  return <WelcomePage />;
}

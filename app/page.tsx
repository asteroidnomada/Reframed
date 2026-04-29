import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Reframed — See your space as a coffee shop, before you build it",
  description:
    "Reframed turns a phone photo of your vacant commercial space into six designer-grade mockups of your future café-meets-coworking spot.",
};

export default function HomePage() {
  return <LandingPage />;
}

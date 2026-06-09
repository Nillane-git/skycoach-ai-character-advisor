import { Hero } from "@/components/hero";
import { WelcomeModal } from "@/components/welcome-modal";

export default function HomePage() {
  return (
    <>
      <WelcomeModal />
      <Hero />
    </>
  );
}

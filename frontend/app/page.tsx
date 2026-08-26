"use client";

import dynamic from "next/dynamic";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { projects } from "@/data/projects";

const Hero = dynamic(() => import("@/components/landing/hero").then((m) => m.Hero), {
  ssr: false,
});

const ModulesSection = dynamic(
  () => import("@/components/landing/modules-section").then((m) => m.ModulesSection),
  { ssr: false },
);

const CardGrid = dynamic(() => import("@/components/landing/card-grid").then((m) => m.CardGrid), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <SiteNav />
      <Hero
        videoSrc="https://videos.pexels.com/video-files/2103099/2103099-uhd_2560_1440_30fps.mp4"
        posterSrc="/hero-poster.jpg"
        headlineTop="O financeiro da"
        headlineMasked="sua frota"
        ctaLabel="COMECE AGORA!"
        ctaTo="/register"
        secondaryCtaLabel="Entrar"
        secondaryCtaTo="/login"
      />

      <ModulesSection />

      <CardGrid cards={projects} />

      <SiteFooter />
    </div>
  );
}

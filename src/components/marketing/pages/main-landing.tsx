"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionWrapper } from "@/components/marketing/section-wrapper";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { StatsBar } from "@/components/marketing/stats-bar";
import { CtaSection } from "@/components/marketing/cta-section";
import { ValueProp } from "@/components/marketing/value-prop";
import { useUser } from "@/hooks/use-user";
import {
  Users,
  Handshake,
  BarChart3,
  Search,
  Package,
  MessageSquare,
  Shield,
  Zap,
  TrendingUp,
  Palette,
} from "lucide-react";

export function MainLandingPage() {
  const { isAuthenticated } = useUser();

  return (
    <>
      {/* Hero */}
      <SectionWrapper className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            The creator marketplace
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Where creators and brands{" "}
            <span className="text-primary">build together</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            ivann is the modern platform where creators monetize their influence
            and brands find the right partners for impactful campaigns — clearly,
            efficiently, and on their own terms.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!isAuthenticated && (
              <>
                <Link
                  href="/signup"
                  className={buttonVariants({ size: "lg" })}
                >
                  Get Started Free
                </Link>
                <Link
                  href="/discover"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Browse Creators
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link
                href="/discover"
                className={buttonVariants({ size: "lg" })}
              >
                Browse Creators
              </Link>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Stats / Social Proof */}
      <SectionWrapper variant="muted">
        <StatsBar
          stats={[
            { value: "10K+", label: "Creators" },
            { value: "2K+", label: "Brands" },
            { value: "50K+", label: "Collaborations" },
            { value: "$5M+", label: "Creator Earnings" },
          ]}
        />
      </SectionWrapper>

      {/* How it works */}
      <SectionWrapper>
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">How ivann works</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Three simple steps to meaningful partnerships
          </p>
        </div>
        <FeatureGrid
          columns={3}
          features={[
            {
              icon: Palette,
              title: "1. Build your profile",
              description:
                "Creators showcase their reach, content style, and service packages. Brands set up their campaign goals and preferences.",
            },
            {
              icon: Search,
              title: "2. Discover and connect",
              description:
                "Brands search and filter creators by niche, platform, audience, and engagement. Send collaboration requests directly.",
            },
            {
              icon: Handshake,
              title: "3. Collaborate and grow",
              description:
                "Negotiate terms, manage deliverables, message in real-time, and build lasting partnerships — all in one place.",
            },
          ]}
        />
      </SectionWrapper>

      {/* For Creators */}
      <SectionWrapper variant="muted">
        <ValueProp
          icon={TrendingUp}
          title="For Creators"
          description="Stop waiting for DMs. ivann puts your profile in front of brands actively looking for partners. Set your rates, list your packages, and let opportunities come to you."
          features={[
            "Professional profile with social stats and verification",
            "Service packages with transparent pricing",
            "Incoming collaboration requests from vetted brands",
            "Real-time messaging and deal management",
          ]}
        />
        <div className="mt-10 text-center">
          <Link
            href="/creators"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Learn more for creators
          </Link>
        </div>
      </SectionWrapper>

      {/* For Brands */}
      <SectionWrapper>
        <ValueProp
          icon={BarChart3}
          title="For Brands"
          description="Find the right creators in minutes, not weeks. ivann gives you powerful search, transparent pricing, and direct communication — no middlemen, no agencies."
          features={[
            "Search by niche, platform, engagement, and location",
            "View real follower counts and verified profiles",
            "Send collaboration requests with one click",
            "Manage all campaigns from a single dashboard",
          ]}
          reversed
        />
        <div className="mt-10 text-center">
          <Link
            href="/brands"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Learn more for brands
          </Link>
        </div>
      </SectionWrapper>

      {/* Platform Features */}
      <SectionWrapper variant="muted">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            A complete toolkit for creator-brand partnerships
          </p>
        </div>
        <FeatureGrid
          columns={4}
          features={[
            {
              icon: Users,
              title: "Creator Profiles",
              description: "Rich profiles with social accounts, stats, and verification badges.",
            },
            {
              icon: Package,
              title: "Service Packages",
              description: "Creators list packages with pricing, deliverables, and delivery timelines.",
            },
            {
              icon: Search,
              title: "Smart Discovery",
              description: "Filter creators by niche, platform, followers, engagement, and location.",
            },
            {
              icon: Handshake,
              title: "Collaboration Requests",
              description: "Brands send offers directly. Creators accept, decline, or counter.",
            },
            {
              icon: MessageSquare,
              title: "Real-Time Messaging",
              description: "Built-in chat for every collaboration. No switching between tools.",
            },
            {
              icon: Zap,
              title: "Instant Notifications",
              description: "In-app and email alerts for requests, messages, and updates.",
            },
            {
              icon: BarChart3,
              title: "Analytics Ready",
              description: "Social stat tracking and engagement metrics across platforms.",
            },
            {
              icon: Shield,
              title: "Verified Accounts",
              description: "Platform verification badges for trusted, active creators.",
            },
          ]}
        />
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper className="py-24 sm:py-32">
        <CtaSection
          heading="Ready to start?"
          description="Join thousands of creators and brands already building partnerships on ivann."
          buttons={[
            { label: "Sign Up as Creator", href: "/signup" },
            { label: "Sign Up as Brand", href: "/signup", variant: "outline" },
          ]}
        />
      </SectionWrapper>
    </>
  );
}

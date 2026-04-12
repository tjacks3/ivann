"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionWrapper } from "@/components/marketing/section-wrapper";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { StatsBar } from "@/components/marketing/stats-bar";
import { CtaSection } from "@/components/marketing/cta-section";
import { ValueProp } from "@/components/marketing/value-prop";
import { FaqSection } from "@/components/marketing/faq-section";
import {
  Search,
  Handshake,
  BarChart3,
  Clock,
  Target,
  MessageSquare,
  Shield,
  Zap,
  Users,
  Filter,
} from "lucide-react";

export function BrandLandingPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            For brands
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Find the right creators.{" "}
            <span className="text-primary">Fast.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Stop spending weeks on manual outreach. ivann gives you instant
            access to a curated marketplace of creators with verified stats,
            transparent pricing, and direct communication — no agencies, no
            middlemen.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Get Started Free
            </Link>
            <Link
              href="/discover"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Browse Creators Now
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* Stats */}
      <SectionWrapper variant="muted">
        <StatsBar
          stats={[
            { value: "10K+", label: "Active Creators" },
            { value: "6", label: "Platforms Covered" },
            { value: "< 5 min", label: "Avg. Time to First Offer" },
            { value: "85%", label: "Response Rate" },
          ]}
        />
      </SectionWrapper>

      {/* Why ivann for brands */}
      <SectionWrapper>
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Why brands use ivann
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            The fastest way to launch creator campaigns
          </p>
        </div>
        <FeatureGrid
          columns={3}
          features={[
            {
              icon: Clock,
              title: "Save hours, not days",
              description:
                "Find creators in your niche in minutes. Filter by platform, audience, engagement, and location — no more spreadsheets.",
            },
            {
              icon: Target,
              title: "Precision targeting",
              description:
                "Search by category, follower range, verified status, and more. Find exactly the right creator for your campaign.",
            },
            {
              icon: BarChart3,
              title: "Real data, real results",
              description:
                "Every creator profile shows verified follower counts and platform stats. No inflated numbers, no guesswork.",
            },
          ]}
        />
      </SectionWrapper>

      {/* Discovery */}
      <SectionWrapper variant="muted">
        <ValueProp
          icon={Search}
          title="Discover creators that fit your brand"
          description="Our discovery engine helps you find creators across YouTube, Instagram, TikTok, and more. Filter by niche, location, audience size, and engagement rate to find the perfect match for your campaign."
          features={[
            "Search across 10+ content categories",
            "Filter by 6+ social platforms",
            "Set follower and engagement range requirements",
            "See verified profiles with real stats",
          ]}
        />
      </SectionWrapper>

      {/* Collaboration flow */}
      <SectionWrapper>
        <ValueProp
          icon={Handshake}
          title="From discovery to deal in minutes"
          description="Found the right creator? Send a collaboration request directly from their profile. Select an existing package or create a custom proposal with your budget and timeline."
          features={[
            "One-click collaboration requests",
            "Choose from creator's existing packages",
            "Custom proposals with your own budget and brief",
            "Automatic thread creation for direct communication",
          ]}
          reversed
        />
      </SectionWrapper>

      {/* Campaign management */}
      <SectionWrapper variant="muted">
        <ValueProp
          icon={Users}
          title="Manage all your creator partnerships"
          description="Track every collaboration from a single dashboard. See pending requests, active partnerships, and message threads — no more juggling emails, DMs, and spreadsheets."
          features={[
            "Centralized collaboration dashboard",
            "Real-time status tracking on every request",
            "Built-in messaging for every partnership",
            "Notification alerts for responses and updates",
          ]}
        />
      </SectionWrapper>

      {/* Platform features */}
      <SectionWrapper>
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Built for efficiency
          </h2>
        </div>
        <FeatureGrid
          columns={4}
          features={[
            {
              icon: Filter,
              title: "Advanced filters",
              description: "Narrow down from thousands of creators to the perfect shortlist in seconds.",
            },
            {
              icon: Shield,
              title: "Verified creators",
              description: "Work with creators who have verified social accounts and real audience data.",
            },
            {
              icon: MessageSquare,
              title: "Direct messaging",
              description: "Communicate directly with creators. No intermediaries, no delays.",
            },
            {
              icon: Zap,
              title: "Instant notifications",
              description: "Know the moment a creator responds to your request or sends a message.",
            },
          ]}
        />
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper variant="muted">
        <FaqSection
          title="Frequently asked questions"
          items={[
            {
              question: "Is ivann free for brands?",
              answer:
                "Yes. Signing up, browsing creators, and sending collaboration requests is completely free. You only pay creators directly for the work you agree on.",
            },
            {
              question: "How do I find the right creator?",
              answer:
                "Use our Discover page to filter creators by niche, platform, follower count, engagement rate, location, and verification status. You can also search by name or username.",
            },
            {
              question: "How does the collaboration process work?",
              answer:
                "Browse a creator's profile and packages, then send a collaboration request with your campaign details and budget. The creator reviews your request and can accept, decline, or start a conversation. Once accepted, a message thread is created for direct communication.",
            },
            {
              question: "Can I send custom proposals?",
              answer:
                "Yes. You can select one of a creator's existing packages or create a fully custom request with your own title, description, budget, and timeline.",
            },
            {
              question: "What types of creators are on ivann?",
              answer:
                "Creators across all niches — fashion, tech, fitness, food, travel, entertainment, business, education, and more. From micro-influencers to large accounts across YouTube, Instagram, TikTok, LinkedIn, and other platforms.",
            },
            {
              question: "How do payments work?",
              answer:
                "Payment terms are agreed directly between you and the creator during the collaboration. Integrated payment processing through Stripe is coming soon to streamline this.",
            },
          ]}
        />
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper className="py-24 sm:py-32">
        <CtaSection
          heading="Launch your next campaign today"
          description="Join thousands of brands discovering and collaborating with creators on ivann."
          buttons={[
            { label: "Get Started Free", href: "/signup" },
            { label: "Browse Creators", href: "/discover", variant: "outline" },
          ]}
        />
      </SectionWrapper>
    </>
  );
}

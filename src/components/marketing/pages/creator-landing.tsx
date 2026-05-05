"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionWrapper } from "@/components/marketing/section-wrapper";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { CtaSection } from "@/components/marketing/cta-section";
import { ValueProp } from "@/components/marketing/value-prop";
import { FaqSection } from "@/components/marketing/faq-section";
import {
  TrendingUp,
  Eye,
  DollarSign,
  Handshake,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  Package,
  UserCheck,
} from "lucide-react";

export function CreatorLandingPage() {
  return (
    <>
      {/* Hero */}
      <SectionWrapper className="py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            For creators
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Monetize your influence.{" "}
            <span className="text-primary">Your way.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Stop chasing brands through DMs. ivann puts your profile in front of
            businesses actively looking for creators like you. Set your rates,
            showcase your reach, and let paid opportunities come to you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonVariants({ size: "lg" })}>
              Create Your Profile
            </Link>
            <Link
              href="/"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Learn About ivann
            </Link>
          </div>
        </div>
      </SectionWrapper>

      {/* Why ivann */}
      <SectionWrapper variant="muted">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Why creators choose ivann
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Built by creators, for creators
          </p>
        </div>
        <FeatureGrid
          columns={3}
          features={[
            {
              icon: Eye,
              title: "Get discovered",
              description:
                "Your profile appears in search results when brands look for creators in your niche, location, and audience size.",
            },
            {
              icon: DollarSign,
              title: "Set your own rates",
              description:
                "List service packages with transparent pricing. No more guessing what to charge or undervaluing your work.",
            },
            {
              icon: Shield,
              title: "Build credibility",
              description:
                "Verified profiles, real social stats, and professional packages show brands you're serious about partnerships.",
            },
          ]}
        />
      </SectionWrapper>

      {/* Showcase your profile */}
      <SectionWrapper>
        <ValueProp
          icon={UserCheck}
          title="A profile that works for you"
          description="Your ivann profile is your professional creator portfolio. Connect your social accounts, display your real stats, and let brands see exactly what you bring to the table."
          features={[
            "Connect YouTube, Instagram, TikTok, and more",
            "Display verified follower counts and engagement rates",
            "Highlight your niche, location, and content style",
            "Link your website, newsletter, and public contact info",
          ]}
        />
      </SectionWrapper>

      {/* Service packages */}
      <SectionWrapper variant="muted">
        <ValueProp
          icon={Package}
          title="Packages that sell themselves"
          description="Create service packages that clearly communicate what brands get. From sponsored posts to full campaign bundles — name your price, define your deliverables, and attract the right offers."
          features={[
            "Multiple package types: UGC, reels, stories, sponsored posts, bundles",
            "Set pricing in your local currency",
            "Define delivery timelines and revision limits",
            "Highlight featured packages on your profile",
          ]}
          reversed
        />
      </SectionWrapper>

      {/* Collaboration flow */}
      <SectionWrapper>
        <ValueProp
          icon={Handshake}
          title="Deals on your terms"
          description="When a brand sends you a deal, you're in control. Review the terms, accept or decline, and manage the entire partnership through ivann's built-in messaging."
          features={[
            "Incoming requests with full campaign details",
            "Accept, decline, or negotiate directly",
            "Real-time messaging for every collaboration",
            "Track all your active partnerships in one place",
          ]}
        />
      </SectionWrapper>

      {/* More features */}
      <SectionWrapper variant="muted">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything to run your creator business
          </h2>
        </div>
        <FeatureGrid
          columns={4}
          features={[
            {
              icon: BarChart3,
              title: "Social stats",
              description: "Track followers, engagement, and growth across all your connected platforms.",
            },
            {
              icon: MessageSquare,
              title: "Built-in chat",
              description: "Communicate with brands directly. No more scattered email threads.",
            },
            {
              icon: Zap,
              title: "Instant alerts",
              description: "Get notified the moment a brand sends you an offer or message.",
            },
            {
              icon: TrendingUp,
              title: "Grow your reach",
              description: "The more active your profile, the higher you appear in brand searches.",
            },
          ]}
        />
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper>
        <FaqSection
          title="Frequently asked questions"
          items={[
            {
              question: "Is ivann free for creators?",
              answer:
                "Yes. Creating your profile, listing packages, and receiving collaboration requests is completely free. We believe creators should keep their earnings.",
            },
            {
              question: "How do I get discovered by brands?",
              answer:
                "Once your profile is published, brands can find you through our Discover page. They can filter by niche, platform, follower count, location, and more. The more complete your profile, the better your visibility.",
            },
            {
              question: "What platforms can I connect?",
              answer:
                "You can connect YouTube, Instagram, TikTok, X (Twitter), LinkedIn, Twitch, and add your website or newsletter. OAuth-based linking is coming soon for automatic stat syncing.",
            },
            {
              question: "How do collaborations work?",
              answer:
                "Brands browse your profile and packages, then send a collaboration request with campaign details and budget. You review the request and can accept, decline, or start a conversation to negotiate terms.",
            },
            {
              question: "Do I need a minimum follower count?",
              answer:
                "No. ivann is for creators of all sizes — from micro-influencers to large accounts. Many brands actively seek smaller creators for authentic, niche partnerships.",
            },
            {
              question: "How do I get paid?",
              answer:
                "Payment terms are agreed between you and the brand during the collaboration. Integrated payment processing via Stripe is coming soon to make this seamless.",
            },
          ]}
        />
      </SectionWrapper>

      {/* Final CTA */}
      <SectionWrapper variant="muted" className="py-24 sm:py-32">
        <CtaSection
          heading="Start earning from your content"
          description="Create your free profile in minutes and start receiving collaboration offers from brands."
          buttons={[
            { label: "Create Your Profile", href: "/signup" },
            { label: "Browse the Platform", href: "/discover", variant: "outline" },
          ]}
        />
      </SectionWrapper>
    </>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustedBySection } from "@/components/landing/TrustedBySection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TechnologySection } from "@/components/landing/TechnologySection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { Footer } from "@/components/landing/Footer";
import { StatsSection } from "@/components/landing/StatsSection";

export interface LandingContent {
  section: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
}

export interface LandingItem {
  id: string;
  section: string;
  title: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  order_index: number | null;
  metadata: any;
}

const Landing = () => {
  const [content, setContent] = useState<LandingContent[]>([]);
  const [items, setItems] = useState<LandingItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [contentData, itemsData] = await Promise.all([
        supabase.from('landing_content').select('*'),
        supabase.from('landing_items').select('*').order('order_index')
      ]);

      if (contentData.data) setContent(contentData.data);
      if (itemsData.data) setItems(itemsData.data);
    };

    fetchData();
  }, []);

  const getContent = (section: string) => {
    return content.find(c => c.section === section);
  };

  const getItems = (section: string) => {
    return items.filter(i => i.section === section);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />
      <HeroSection content={getContent('hero')} />
      <TrustedBySection content={getContent('trusted_by')} items={getItems('trusted_by')} />
      <FeaturesSection content={getContent('features')} items={getItems('features')} />
      <TechnologySection content={getContent('technology')} items={getItems('technology')} />
      <HowItWorksSection content={getContent('how_it_works')} items={getItems('how_it_works')} />
      <StatsSection />
      <PricingSection content={getContent('pricing')} items={getItems('pricing')} />
      <TestimonialsSection content={getContent('testimonials')} items={getItems('testimonials')} />
      <BenefitsSection content={getContent('benefits')} ctaContent={getContent('benefits_cta')} items={getItems('benefits')} />
      <FAQSection content={getContent('faq')} items={getItems('faq')} />
      <FinalCTASection content={getContent('final_cta')} />
      <Footer />
    </div>
  );
};

export default Landing;

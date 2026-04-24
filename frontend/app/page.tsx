import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import TargetAudience from '@/components/landing/TargetAudience';
import Features from '@/components/landing/Features';
import SecurityPromise from '@/components/landing/SecurityPromise';
import Stats from '@/components/landing/Stats';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';
import NewsletterAlerts from '@/components/landing/NewsletterAlerts';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <Hero />
            <HowItWorks />
            <TargetAudience />
            <Features />
            <SecurityPromise />
            <Stats />
            <TestimonialsSection />
            <FAQ />
            <FinalCTA />
            <NewsletterAlerts />
            <Footer />
        </main>
    );
}

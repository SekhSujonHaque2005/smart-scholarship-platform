import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { SpotlightBackground } from '@/components/ui/spotlight-background';

export default function TermsPage() {
    return (
        <SpotlightBackground gridSize={64} spotlightColor="56, 189, 248" spotlightSize={440}>
            <Navbar />
            <main className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center">
                            Terms of Service
                        </h1>
                        <p className="text-muted-foreground text-center">Last Updated: April 24, 2026</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using ScholarHub, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. User Eligibility</h2>
                            <p>
                                Our services are intended for students and scholarship providers. You must provide accurate and complete information when creating an account. Misrepresentation of academic or financial data may lead to account suspension.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. Use of the Platform</h2>
                            <p>
                                You agree to use ScholarHub only for lawful purposes. You are responsible for all activity that occurs under your account. You may not:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Submit fraudulent scholarship applications.</li>
                                <li>Attempt to scrape data in an unauthorized manner.</li>
                                <li>Impersonate other users or scholarship providers.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Scholarship Matching</h2>
                            <p>
                                While our AI matching engine strives for high accuracy, ScholarHub does not guarantee scholarship approval. The final decision rests solely with the scholarship providers.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">5. Limitation of Liability</h2>
                            <p>
                                ScholarHub is a marketplace connecting students and providers. We are not liable for any disputes, financial losses, or missed opportunities resulting from the use of our platform.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </SpotlightBackground>
    );
}

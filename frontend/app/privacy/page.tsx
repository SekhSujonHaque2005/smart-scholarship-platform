import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { SpotlightBackground } from '@/components/ui/spotlight-background';

export default function PrivacyPage() {
    return (
        <SpotlightBackground gridSize={64} spotlightColor="56, 189, 248" spotlightSize={440}>
            <Navbar />
            <main className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center">
                            Privacy Policy
                        </h1>
                        <p className="text-muted-foreground text-center">Last Updated: April 24, 2026</p>
                    </div>

                    <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                            <p>
                                ScholarHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our scholarship matching services.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us when you create an account, build your student profile, or communicate with us. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Personal identification (Name, email address, phone number).</li>
                                <li>Academic records (CGPA, field of study, university details).</li>
                                <li>Socio-economic data (Income level, category) for scholarship eligibility matching.</li>
                                <li>Uploaded documents (Certificates, ID proofs).</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
                            <p>
                                Your information is used primarily to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Match you with eligible scholarship opportunities using our AI engine.</li>
                                <li>Facilitate scholarship applications to verified providers.</li>
                                <li>Send notifications about application status and new opportunities.</li>
                                <li>Improve our platform's algorithms and user experience.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">4. Data Security</h2>
                            <p>
                                We implement industry-standard security measures, including encryption and secure server protocols, to protect your personal data from unauthorized access or disclosure.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </SpotlightBackground>
    );
}

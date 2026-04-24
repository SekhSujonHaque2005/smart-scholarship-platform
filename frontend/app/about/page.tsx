import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { SpotlightBackground } from '@/components/ui/spotlight-background';

export default function AboutPage() {
    return (
        <SpotlightBackground gridSize={64} spotlightColor="56, 189, 248" spotlightSize={440}>
            <Navbar />
            <main className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto relative z-10">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                            About ScholarHub
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Empowering students across India with AI-driven scholarship matching and a seamless application experience.
                        </p>
                    </div>

                    <div className="grid gap-12 text-muted-foreground leading-relaxed">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">Our Mission</h2>
                            <p>
                                At ScholarHub, we believe that financial constraints should never stand in the way of education. Our mission is to democratize access to scholarships by aggregating opportunities from government, private, and non-profit sectors into a single, intelligent platform.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">How it Works</h2>
                            <p>
                                Using advanced machine learning, we analyze thousands of scholarship data points against your unique profile—academic records, field of study, location, and socio-economic background—to find the perfect matches with the highest probability of success.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-foreground">Our Commitment</h2>
                            <p>
                                We are committed to transparency and security. Every provider on our platform undergoes a rigorous verification process, and your data is protected with industry-standard encryption and privacy practices.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </SpotlightBackground>
    );
}

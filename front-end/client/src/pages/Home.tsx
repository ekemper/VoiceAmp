import NavBar from "@/components/NavBar";
import DemoSection from "@/components/DemoSection";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export default function Home() {
  const { ref: refAbout, inView: inViewAbout } = useScrollAnimation();

  // We're now handling smooth scrolling with dedicated handlers using the scrollToElement utility function
  
  return (
    <div className="min-h-screen bg-gray-custom">
      <NavBar />
      <main>
        <DemoSection />
        
        {/* About Section */}
        <section id="about" className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div 
              ref={refAbout}
              className={`max-w-4xl mx-auto transition-all duration-700 ${
                inViewAbout ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex items-center justify-center mb-8">
                <div className="h-0.5 bg-teal/30 w-16"></div>
                <h2 className="text-4xl md:text-5xl font-bold text-teal px-4 font-playfair tracking-tight">Our Mission</h2>
                <div className="h-0.5 bg-teal/30 w-16"></div>
              </div>
              
              <p className="text-lg text-navy mb-8 leading-relaxed">
                VoiceAmp is an AI-powered platform designed to empower mission-driven organizations to craft compelling grant applications that reflect their authentic voice. By combining natural language intelligence with a deep understanding of funding landscapes, VoiceAmp helps nonprofits amplify data, impact stories, and civic purpose — faster, smarter, and with greater resonance.
              </p>
              
              <p className="text-lg text-navy mb-8 leading-relaxed">
                We believe that every mission-driven organization has a unique perspective and impact story that deserves to be heard. Our technology is designed to amplify these authentic voices, not replace them with generic grant-speak or jargon.
              </p>

              <div className="flex items-center justify-center my-12">
                <div className="h-0.5 bg-amber/30 w-16"></div>
                <h2 className="text-4xl md:text-5xl font-bold text-amber px-4 font-playfair tracking-tight">Our Vision</h2>
                <div className="h-0.5 bg-amber/30 w-16"></div>
              </div>
              
              <p className="text-lg text-navy mb-8 leading-relaxed">
                We envision a world where funding is more accessible to organizations doing vital work in their communities, regardless of their size or grant-writing expertise. By democratizing access to effective grant-writing tools, we aim to help shift more resources to impactful organizations that might otherwise be overlooked.
              </p>
              
              <p className="text-lg text-navy leading-relaxed">
                Our platform focuses on weaving together three essential elements of successful grant applications:
              </p>
              
              <ul className="list-disc pl-8 mt-6 space-y-4 text-navy">
                <li>
                  <span className="font-bold text-teal">Authentic Voice:</span> We preserve and enhance your organization's unique tone and perspective, ensuring your applications never sound generic or artificial.
                </li>
                <li>
                  <span className="font-bold text-teal">Data-Driven Narratives:</span> We help you integrate compelling data points and impact metrics that strengthen your case for funding.
                </li>
                <li>
                  <span className="font-bold text-burgundy">Community Context:</span> We emphasize the civic purpose and community connections that make your work meaningful and necessary.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

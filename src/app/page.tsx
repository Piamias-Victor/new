import { Hero } from "@/components/home/Hero";
import { Features } from "@/components/home/Features";
import { About } from "@/components/home/About";
import { Objectives } from "@/components/home/Objectives";
import { Contact } from "@/components/home/Contact";

/**
 * Home Page Component
 * 
 * Main landing page for Apo Data project presentation.
 * Displays information about the project, company and objectives
 * in a clean, modern design with teal/blue/green color scheme.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content container */}
      <main className="flex-1">
        {/* Hero section with main project introduction */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <Hero />
        </div>
        
        {/* Features section highlighting key capabilities */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <Features />
        </div>
        
        {/* About Phardev section */}
        <About />
        
        {/* Project objectives section */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <Objectives />
        </div>
        
        {/* Contact section */}
        <Contact />
      </main>
    </div>
  );
}
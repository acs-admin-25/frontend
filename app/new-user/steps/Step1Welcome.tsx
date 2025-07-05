import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Globe, Sparkles, Zap, Users } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils/utils';

interface Step1WelcomeProps {
  onContinue: () => void;
}

const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onContinue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full h-full flex flex-col justify-center space-y-8 px-6"
  >
    {/* Hero Section */}
    <div className="text-center space-y-4">
      <div className="flex justify-center mb-3">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
          <div className="relative bg-gradient-to-r from-primary to-secondary p-3 rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold font-display">
        <span className="text-foreground">Welcome to </span>
        <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-text">
          ACS!
        </span>
      </h1>
      
      <p className="text-lg text-foreground/80 w-full max-w-4xl mx-auto leading-relaxed font-sans">
        We're thrilled to have you join the Automated Consultancy Services family. 
        ACS is dedicated to revolutionizing the way businesses handle customer interactions 
        through intelligent automation and personalized service.
      </p>
    </div>
    
    {/* Features Grid - Full Width */}
    <div className="grid lg:grid-cols-2 gap-6 w-full">
      {/* What We Do Card */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "rounded-xl p-6 border w-full",
          "bg-gradient-to-br from-card to-card/50",
          "border-border shadow-lg",
          "hover:shadow-xl transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-primary to-secondary p-2.5 rounded-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-display">What We Do</h2>
        </div>
        
        <div className="space-y-3 text-foreground/70">
          <p className="leading-relaxed font-sans">
            At ACS, we specialize in creating seamless, automated solutions that enhance 
            your business's efficiency while maintaining a personal touch.
          </p>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <div className="bg-status-success/10 p-1 rounded-full mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              </div>
              <span className="text-foreground/80 font-medium font-sans text-sm">Intelligent email automation and response management</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="bg-status-success/10 p-1 rounded-full mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              </div>
              <span className="text-foreground/80 font-medium font-sans text-sm">Advanced lead tracking and conversion optimization</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="bg-status-success/10 p-1 rounded-full mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              </div>
              <span className="text-foreground/80 font-medium font-sans text-sm">Customizable communication workflows</span>
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Why Choose ACS Card */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "rounded-xl p-6 border w-full",
          "bg-gradient-to-br from-secondary/5 to-primary/5",
          "border-border shadow-lg",
          "hover:shadow-xl transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-secondary to-primary p-2.5 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground font-display">Why Choose ACS</h2>
        </div>
        
        <div className="space-y-3 text-foreground/70">
          <p className="leading-relaxed font-sans">
            Our platform combines cutting-edge AI technology with human expertise to deliver 
            exceptional customer experiences that drive real results.
          </p>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2.5">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <Users className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-foreground/80 font-medium font-sans text-sm">Personalized customer interactions</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-foreground/80 font-medium font-sans text-sm">Lightning-fast response times</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-foreground/80 font-medium font-sans text-sm">AI-powered insights and analytics</span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
    
    {/* CTA Section - Full Width */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="text-center space-y-4 w-full"
    >
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20 w-full">
        <h3 className="text-xl font-bold text-foreground mb-3 font-display">
          Ready to Get Started?
        </h3>
        <p className="text-foreground/70 mb-4 max-w-2xl mx-auto font-sans">
          Let's set up your ACS account and get you on the path to automated success.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className={cn(
            "px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto",
            "bg-gradient-to-r from-primary to-secondary text-white",
            "hover:from-primary/90 hover:to-secondary/90 transition-all duration-300",
            "focus:outline-none focus:ring-4 focus:ring-primary/30",
            "shadow-lg hover:shadow-xl font-sans"
          )}
        >
          Continue Setup
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

export default Step1Welcome; 
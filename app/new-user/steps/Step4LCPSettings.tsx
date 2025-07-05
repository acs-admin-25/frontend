import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Sparkles } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils/utils';

interface LcpSettingsData {
    tone: string;
    style: string;
    samplePrompt: string;
}

interface Step4LCPSettingsProps {
  data: LcpSettingsData;
  setData: (data: LcpSettingsData) => void;
  onContinue: () => void;
  onBack: () => void;
  loading: boolean;
}

const Step4LCPSettings: React.FC<Step4LCPSettingsProps> = ({
  data,
  setData,
  onContinue,
  onBack,
  loading
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-8 max-w-4xl mx-auto"
  >
    {/* Header Section */}
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center justify-center gap-3 mb-4"
      >
        <div className="p-3 bg-primary/10 rounded-full">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <div className="p-3 bg-secondary/10 rounded-full">
          <Sparkles className="w-8 h-8 text-secondary" />
        </div>
      </motion.div>
      
      <div className="space-y-3">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Customize Your AI Assistant
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Personalize how your AI generates email responses to match your unique communication style
        </p>
      </div>
    </div>

    {/* Main Content Card */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-card rounded-2xl p-8 border border-border shadow-xl backdrop-blur-sm"
    >
      <div className="space-y-8">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Tone Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <label className="text-sm font-semibold text-primary-foreground">Email Tone</label>
            </div>
            <select
              value={data.tone}
              onChange={(e) => setData({ ...data, tone: e.target.value })}
              className={cn(
                "w-full p-4 rounded-xl bg-card-light text-foreground border-2 border-primary/20",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                "transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
                "appearance-none shadow-sm"
              )}
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="empathetic">Empathetic</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Choose the overall tone that best represents your communication style
            </p>
          </div>

          {/* Writing Style Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <label className="text-sm font-semibold text-foreground">Writing Style</label>
            </div>
            <select
              value={data.style}
              onChange={(e) => setData({ ...data, style: e.target.value })}
              className={cn(
                "w-full p-4 rounded-xl bg-card-light text-foreground border-2 border-secondary/20",
                "focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary",
                "transition-all duration-200 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/10",
                "appearance-none shadow-sm"
              )}
            >
              <option value="concise">Concise</option>
              <option value="detailed">Detailed</option>
              <option value="conversational">Conversational</option>
              <option value="technical">Technical</option>
              <option value="persuasive">Persuasive</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Select how detailed and structured your AI responses should be
            </p>
          </div>
        </div>

        {/* Sample Email Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-accent rounded-full"></div>
            <label className="text-sm font-semibold text-foreground">Sample Email</label>
          </div>
          <textarea
            value={data.samplePrompt}
            onChange={(e) => setData({ ...data, samplePrompt: e.target.value })}
            className={cn(
              "w-full h-40 p-4 rounded-xl bg-card-light text-foreground border-2 border-accent/20",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
              "transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 resize-none",
              "placeholder:text-muted-foreground/60 shadow-sm"
            )}
            placeholder="Enter a sample email that represents your preferred writing style. This helps the AI understand your unique voice and communication patterns..."
          />
          <p className="text-sm text-muted-foreground">
            Provide an example of your writing to help the AI match your style
          </p>
        </div>
      </div>
    </motion.div>

    {/* Action Buttons */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="flex justify-between gap-6"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className={cn(
          "px-8 py-4 rounded-xl font-semibold transition-all duration-200",
          "bg-muted hover:bg-muted/80 text-muted-foreground",
          "border border-border hover:border-border/60",
          "flex items-center gap-2"
        )}
      >
        Back
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onContinue}
        disabled={loading}
        className={cn(
          "px-8 py-4 rounded-xl font-semibold transition-all duration-200",
          "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90",
          "text-text-inverse shadow-lg hover:shadow-xl",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center gap-3"
        )}
      >
        {loading ? (
          <>
            <div className=" text-text-inverse w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
            Saving...
          </>
        ) : (
          <>
            Save and Continue
            <CheckCircle2 className="w-5 h-5" />
          </>
        )}
      </motion.button>
    </motion.div>
  </motion.div>
);

export default Step4LCPSettings; 
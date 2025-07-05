import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface SettingsData {
  signature: string;
  smsEnabled: boolean;
  phone: string;
  autoEmails: boolean;
}

interface Step5SettingsProps {
  data: SettingsData;
  setData: (data: SettingsData) => void;
  onContinue: () => void;
  onBack: () => void;
  loading: boolean;
}

const Step5Settings: React.FC<Step5SettingsProps> = ({
  data,
  setData,
  onContinue,
  onBack,
  loading,
}) => {
  const canEnableSms = data.phone.replace(/[^0-9]/g, '').length > 0;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setData({ ...data, [name]: type === 'checkbox' ? checked : value });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="flex flex-col items-center justify-center min-h-[80vh]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        className="bg-card rounded-xl p-8 border border-border max-w-lg w-full shadow-2xl"
      >
        <div className="flex flex-col items-center mb-6">
          <Mail className="w-10 h-10 text-primary mb-2" />
          <h2 className="text-2xl font-bold mb-1 text-foreground">Default Email Signature</h2>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            All automated emails sent by ACS will end with this signature.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <textarea
              name="signature"
              className={cn(
                "w-full p-3 rounded-md bg-background text-foreground border border-input",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                "transition-all duration-200 placeholder:text-muted-foreground"
              )}
              rows={3}
              value={data.signature}
              onChange={handleChange}
              placeholder="Best regards,&#10;Your Name&#10;Your Company"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              name="smsEnabled"
              id="smsEnabled"
              checked={data.smsEnabled && canEnableSms}
              onChange={handleChange}
              className="accent-primary"
              disabled={!canEnableSms}
            />
            <label 
              htmlFor="smsEnabled" 
              className={cn(
                "text-sm",
                !canEnableSms ? "text-muted-foreground" : "text-foreground"
              )}
            >
              Enable SMS notifications
            </label>
            <div className="flex items-center ml-4">
              <span className="text-muted-foreground">+1</span>
              <input
                type="tel"
                name="phone"
                className={cn(
                  "ml-1 p-2 rounded-md bg-background text-foreground border border-input",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                  "w-40 transition-all duration-200 placeholder:text-muted-foreground"
                )}
                placeholder="Phone number"
                value={data.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="autoEmails"
              name="autoEmails"
              checked={data.autoEmails}
              onChange={handleChange}
              className="accent-primary"
            />
            <label htmlFor="autoEmails" className="text-sm text-foreground">
              Allow automated emails
            </label>
          </div>
        </div>
        <div className="flex justify-between mt-8">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-semibold transition-colors text-foreground"
            >
                Back
            </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onContinue}
            disabled={loading}
            className={cn(
              "px-6 py-2 rounded-lg font-semibold transition-all duration-200",
              "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
              "hover:from-green-600 hover:to-emerald-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? 'Saving...' : 'Save & Go to Dashboard'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Step5Settings; 
import React, { useState } from 'react';
import { Mail, CheckCircle2, Shield, Zap, Globe, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  verifyDomainIdentity, 
  verifyDomainDKIM, 
  extractDomainFromEmail,
  validateEmailFormat,
  type DomainVerificationState 
} from '@/lib/utils/new-user';
import { useSession } from 'next-auth/react';

interface EmailData {
    responseEmail: string;
    customDomain: string;
    customEmail: string;
    emailOption: 'default' | 'custom';
}

interface Step3EmailSetupProps {
  data: EmailData;
  setData: (data: EmailData) => void;
  onContinue: () => void;
  onBack: () => void;
  loading: boolean;
}

const Step3EmailSetup: React.FC<Step3EmailSetupProps> = ({
  data,
  setData,
  onContinue,
  onBack,
  loading,
}) => {
  const { data: session } = useSession();
  const userId = (session as any)?.user?.id;
  
  const [verificationState, setVerificationState] = useState<DomainVerificationState>({
    identityVerified: false,
    dkimVerified: false,
    identityLoading: false,
    dkimLoading: false,
    identityError: null,
    dkimError: null
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    
    // Reset verification state when email changes
    if (name === 'customEmail') {
      setVerificationState(prev => ({
        ...prev,
        identityVerified: false,
        dkimVerified: false,
        identityError: null,
        dkimError: null
      }));
    }
  };

  const handleVerifyIdentity = async () => {
    if (!data.customEmail || !validateEmailFormat(data.customEmail)) {
      setVerificationState(prev => ({
        ...prev,
        identityError: 'Please enter a valid email address'
      }));
      return;
    }

    const domain = extractDomainFromEmail(data.customEmail);
    if (!domain) {
      setVerificationState(prev => ({
        ...prev,
        identityError: 'Invalid domain in email address'
      }));
      return;
    }

    setVerificationState(prev => ({
      ...prev,
      identityLoading: true,
      identityError: null
    }));

    try {
      const result = await verifyDomainIdentity(domain);
      
      setVerificationState(prev => ({
        ...prev,
        identityLoading: false,
        identityVerified: result.success,
        identityError: result.success ? null : result.error || null
      }));
    } catch (error) {
      setVerificationState(prev => ({
        ...prev,
        identityLoading: false,
        identityError: 'Failed to verify domain identity'
      }));
    }
  };

  const handleVerifyDKIM = async () => {
    if (!data.customEmail || !validateEmailFormat(data.customEmail)) {
      setVerificationState(prev => ({
        ...prev,
        dkimError: 'Please enter a valid email address'
      }));
      return;
    }

    const domain = extractDomainFromEmail(data.customEmail);
    if (!domain) {
      setVerificationState(prev => ({
        ...prev,
        dkimError: 'Invalid domain in email address'
      }));
      return;
    }

    setVerificationState(prev => ({
      ...prev,
      dkimLoading: true,
      dkimError: null
    }));

    try {
      const result = await verifyDomainDKIM(domain);
      
      setVerificationState(prev => ({
        ...prev,
        dkimLoading: false,
        dkimVerified: result.success,
        dkimError: result.success ? null : result.error || null
      }));
    } catch (error) {
      setVerificationState(prev => ({
        ...prev,
        dkimLoading: false,
        dkimError: 'Failed to verify domain DKIM'
      }));
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="bg-card border border-border/50 rounded-xl shadow-sm p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-4 h-4 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            Email Configuration
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Choose your professional email setup for seamless communication with clients.
          </p>
        </div>

        {/* Email Option Selection */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setData({ ...data, emailOption: 'default' })}
              className={cn(
                "relative p-4 rounded-lg border transition-all duration-200 text-left",
                "hover:shadow-sm hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40",
                data.emailOption === 'default' 
                  ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/40" 
                  : "border-border bg-card hover:bg-accent/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-md transition-colors border-2",
                  data.emailOption === 'default' 
                    ? "bg-primary text-muted-foreground border-primary-foreground" 
                    : "bg-card text-muted-foreground border-primary-foreground"
                )}>
                  <Zap className={cn(
                    "w-5 h-5",
                    data.emailOption === 'default' ? "text-white" : "text-primary"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    ACS Domain
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Quick setup with our professional domain
                  </p>
                </div>
              </div>
              {data.emailOption === 'default' && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setData({ ...data, emailOption: 'custom' })}
              className={cn(
                "relative p-4 rounded-lg border transition-all duration-200 text-left",
                "hover:shadow-sm hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40",
                data.emailOption === 'custom' 
                  ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/40" 
                  : "border-border bg-card hover:bg-accent/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-md transition-colors border-2",
                  data.emailOption === 'custom' 
                    ? "bg-primary text-muted-foreground border-primary-foreground" 
                    : "bg-card text-muted-foreground border-primary-foreground"
                )}>
                  <Globe className={cn(
                    "w-5 h-5",
                    data.emailOption === 'custom' ? "text-white" : "text-primary"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm mb-1">
                    Custom Domain
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Use your own domain for branding
                  </p>
                </div>
              </div>
              {data.emailOption === 'custom' && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Email Configuration */}
        {data.emailOption === 'default' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                ACS Email Address
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  name="responseEmail"
                  value={data.responseEmail.split('@')[0]}
                  onChange={e => setData({ ...data, responseEmail: `${e.target.value}@homes.automatedconsultancy.com` })}
                  className="flex-1 text-sm h-9"
                  placeholder="username"
                  autoComplete="off"
                />
                <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
                  @homes.automatedconsultancy.com
                </span>
              </div>
            </div>
            
            <div className="bg-accent/30 border border-border/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-foreground text-sm">ACS Domain Benefits</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Secure & spam protected</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>ACS tools integration</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Professional branding</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Instant setup</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Custom Email Address
              </label>
              <Input
                type="email"
                name="customEmail"
                value={data.customEmail}
                onChange={handleEmailChange}
                placeholder="your.name@yourdomain.com"
                autoComplete="off"
                className="text-sm h-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleVerifyIdentity}
                disabled={loading || verificationState.identityLoading || !data.customEmail}
                className="flex items-center gap-2 text-xs h-8 px-3" 
              >
                {verificationState.identityLoading ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : verificationState.identityVerified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                ) : (
                  <Shield className="w-3 h-3" />
                )}
                {verificationState.identityLoading ? 'Verifying...' : 'Verify Identity'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleVerifyDKIM}
                disabled={loading || verificationState.dkimLoading || !data.customEmail}
                className="flex items-center gap-2 text-xs h-8 px-3" 
              >
                {verificationState.dkimLoading ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : verificationState.dkimVerified ? (
                  <CheckCircle2 className="w-3 h-3 text-green-600" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                {verificationState.dkimLoading ? 'Verifying...' : 'Verify DKIM'}
              </Button>
            </div>

            {/* Verification Status Messages */}
            {(verificationState.identityError || verificationState.dkimError) && (
              <div className="space-y-2">
                {verificationState.identityError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-700">{verificationState.identityError}</span>
                  </div>
                )}
                {verificationState.dkimError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-red-700">{verificationState.dkimError}</span>
                  </div>
                )}
              </div>
            )}

            {(verificationState.identityVerified || verificationState.dkimVerified) && (
              <div className="space-y-2">
                {verificationState.identityVerified && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700">Domain identity verified successfully</span>
                  </div>
                )}
                {verificationState.dkimVerified && (
                  <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-700">Domain DKIM verified successfully</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-accent/30 border border-border/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-foreground text-sm">Custom Domain Benefits</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Full branding control</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Professional appearance</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Enhanced trust</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Email ownership</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2 h-9 px-4"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Button>
          <Button 
            type="button" 
            size="sm" 
            onClick={onContinue} 
            disabled={loading}
            className={cn(
              "group flex items-center gap-2 h-9 px-4 font-medium border border-primary bg-card text-primary transition-colors",
              !loading && "hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
              loading && "opacity-60 cursor-not-allowed"
            )}
            tabIndex={0}
            aria-label="Continue"
          >
            {loading ? 'Saving...' : (
              <span className="flex items-center gap-2 group-hover:text-white group-focus:text-white group-active:text-white">
                <span className="transition-colors">Continue</span>
                <ArrowRight className="w-3 h-3 transition-colors text-inherit" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Step3EmailSetup; 
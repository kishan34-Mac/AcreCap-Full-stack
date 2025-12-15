import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, User, ArrowRight, Leaf, Eye, EyeOff, Phone } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().optional(),
});

const phoneSchema = z.object({
  phone: z.string().trim().regex(/^\+[1-9]\d{6,14}$/,{ message: 'Enter phone in E.164 format with + country code (e.g., +15551234567, +919692655795)' }),
  name: z.string().optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; phone?: string }>({});
  const [isPhoneMode, setIsPhoneMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpStage, setOtpStage] = useState<'none'|'email_reset'|'phone_login'|'phone_signup'>('none');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const redirectParam = (() => {
    const sp = new URLSearchParams(location.search);
    return sp.get('redirect') || undefined;
  })();
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS as string | undefined)?.split(',').map(e => e.trim().toLowerCase()).filter(Boolean) || [];
  const defaultDestinationFor = (email?: string | null) => {
    const em = email?.toLowerCase() || '';
    return em && ADMIN_EMAILS.includes(em) ? '/admin' : '/dashboard';
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const dest = redirectParam || defaultDestinationFor(session.user.email);
        navigate(dest);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const dest = redirectParam || defaultDestinationFor(session.user.email);
        navigate(dest);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectParam]);

  const validateForm = () => {
    try {
      if (isPhoneMode) {
        phoneSchema.parse({ phone, name: !isLogin ? name : undefined });
        setErrors({});
        return true;
      }
      authSchema.parse({ email, password, name: !isLogin ? name : undefined });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string; name?: string; phone?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Phone-based flows (OTP)
      if (isPhoneMode) {
        const phoneNumber = phone.trim();
        if (isLogin) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
            options: { channel: 'sms' },
          });
          if (error) {
            if (error.message.toLowerCase().includes('unsupported phone provider') || error.message.toLowerCase().includes('phone provider')) {
              toast({
                title: 'Phone login not configured',
                description: 'SMS provider is not enabled for this project. Please use Email login or ask admin to enable Phone Auth (Twilio/Vonage) in Supabase.',
                variant: 'destructive',
              });
              return;
            }
            throw error;
          }
          setOtpSent(true);
          setOtpStage('phone_login');
          toast({ title: 'OTP sent', description: 'We sent a verification code to your phone.' });
          return;
        } else {
          const { error } = await supabase.auth.signInWithOtp({
            phone: phoneNumber,
            options: { channel: 'sms', shouldCreateUser: true, data: { full_name: name.trim() } },
          });
          if (error) {
            if (error.message.toLowerCase().includes('unsupported phone provider') || error.message.toLowerCase().includes('phone provider')) {
              toast({
                title: 'Phone signup not configured',
                description: 'SMS provider is not enabled for this project. Please use Email signup or ask admin to enable Phone Auth (Twilio/Vonage) in Supabase.',
                variant: 'destructive',
              });
              return;
            }
            throw error;
          }
          setOtpSent(true);
          setOtpStage('phone_signup');
          toast({ title: 'OTP sent', description: 'We sent a verification code to your phone to complete signup.' });
          return;
        }
      }

      // Email/password flows
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else if (error.message.toLowerCase().includes('invalid api key')) {
            toast({
              title: 'Supabase configuration error',
              description: 'Invalid API key. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env match the same Supabase project.',
              variant: 'destructive',
            });
          } else {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
          return;
        }

        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
        const { data: { session: postSession } } = await supabase.auth.getSession();
        const dest = redirectParam || defaultDestinationFor(postSession?.user?.email ?? email.trim());
        navigate(dest);
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: redirectUrl, data: { full_name: name.trim() } },
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast({ title: 'Account Exists', description: 'This email is already registered. Please login instead.', variant: 'destructive' });
            setIsLogin(true);
          } else if (error.message.toLowerCase().includes('invalid api key')) {
            toast({ title: 'Supabase configuration error', description: 'Invalid API key. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env match the same Supabase project.', variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
          return;
        }

        const sessionCreated = !!data?.session;
        toast({ title: 'Account Created!', description: sessionCreated ? 'Welcome to AcreCap. You are now logged in.' : 'Please check your email to confirm your account before logging in.' });
        if (sessionCreated) {
          const dest = redirectParam || defaultDestinationFor(data?.user?.email ?? email.trim());
          navigate(dest);
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'An unexpected error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      // Basic email validation before OTP
      const parsed = z.string().trim().email().safeParse(email);
      if (!parsed.success) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        return;
      }
      setIsLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false, emailRedirectTo: redirectUrl },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        // Fallback to reset link if Email OTP is not enabled in project settings
        if (msg.includes('otp') || msg.includes('not allowed') || msg.includes('provider') || msg.includes('email not enabled')) {
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl });
          if (resetErr) throw resetErr;
          toast({ title: 'Reset link sent', description: 'Check your inbox for the password reset link.' });
          setOtpSent(false);
          setOtpStage('none');
          return;
        }
        throw error;
      }
      setOtpSent(true);
      setOtpStage('email_reset');
      toast({ title: 'OTP sent', description: 'Check your email for a verification code to reset your password.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to send email. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailReset = async () => {
    try {
      if (!otpCode.trim() || !newPassword.trim()) {
        toast({ title: 'Missing information', description: 'Enter the code sent to your email and a new password.' });
        return;
      }
      setIsLoading(true);
      const { error } = await supabase.auth.verifyOtp({ type: 'email', email: email.trim(), token: otpCode.trim() });
      if (error) throw error;
      const { error: updErr } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (updErr) throw updErr;
      toast({ title: 'Password updated', description: 'Your password has been reset successfully.' });
      setOtpSent(false);
      setOtpStage('none');
      setOtpCode('');
      setNewPassword('');
      setIsLogin(true);
    } catch (e: any) {
      toast({ title: 'Verification failed', description: e?.message || 'Unable to verify code or update password.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      if (!otpCode.trim()) {
        toast({ title: 'Missing code', description: 'Enter the OTP sent to your phone.' });
        return;
      }
      setIsLoading(true);
      const { error } = await supabase.auth.verifyOtp({ type: 'sms', phone: phone.trim(), token: otpCode.trim() });
      if (error) throw error;
      // Optional: attach full_name after signup if not already
      if (otpStage === 'phone_signup' && name.trim()) {
        await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      }
      toast({ title: 'Verified', description: 'You are now signed in.' });
      setOtpSent(false);
      setOtpStage('none');
      setOtpCode('');
      navigate(redirectParam || '/');
    } catch (e: any) {
      toast({ title: 'Verification failed', description: e?.message || 'Unable to verify OTP.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">AcreCap</span>
            </Link>
          </div>

          {/* Card */}
          <div className="glass-card rounded-3xl p-8">
            {/* Tabs */}
            <div className="flex rounded-xl bg-secondary p-1 mb-8">
              <button
                onClick={() => { setIsLogin(true); setOtpSent(false); setOtpStage('none'); }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  isLogin
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setOtpSent(false); setOtpStage('none'); }}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  !isLogin
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && !isPhoneMode && (
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                    Full Name
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                </div>
              )}

              {/* Toggle between Email and Phone modes */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">Use {isPhoneMode ? 'Phone' : 'Email'}</Label>
                <Button type="button" variant="secondary" size="sm" onClick={() => { setIsPhoneMode(!isPhoneMode); setOtpSent(false); setOtpStage('none'); }}>
                  {isPhoneMode ? 'Use Email' : 'Use Phone'}
                </Button>
              </div>

              {!isPhoneMode && (
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                      className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </div>
              )}

              {isPhoneMode && (
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                    Mobile Number
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone with country code (e.g., +15551234567)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                  {!isLogin && (
                    <div className="mt-4">
                      <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name (optional)</Label>
                      <div className="relative mt-2">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isPhoneMode && (
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                  {isLogin && (
                    <div className="flex justify-end mt-2">
                      <button type="button" className="text-sm text-primary hover:underline" onClick={handleForgotPassword}>
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* OTP Verification Panels */}
              {otpSent && otpStage === 'email_reset' && (
                <div className="border border-border rounded-xl p-4 bg-secondary/30">
                  <h3 className="text-sm font-semibold mb-2">Reset via Email OTP</h3>
                  <div className="flex gap-3">
                    <Input placeholder="Enter OTP code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                    <Input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" variant="accent" onClick={handleVerifyEmailReset} disabled={isLoading}>Verify & Reset</Button>
                    <Button type="button" variant="secondary" onClick={() => { setOtpSent(false); setOtpStage('none'); setOtpCode(''); setNewPassword(''); }}>Cancel</Button>
                  </div>
                </div>
              )}

              {otpSent && (otpStage === 'phone_login' || otpStage === 'phone_signup') && (
                <div className="border border-border rounded-xl p-4 bg-secondary/30">
                  <h3 className="text-sm font-semibold mb-2">Verify Phone OTP</h3>
                  <div className="flex gap-3">
                    <Input placeholder="Enter OTP code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button type="button" variant="accent" onClick={handleVerifyPhoneOtp} disabled={isLoading}>Verify Code</Button>
                    <Button type="button" variant="secondary" onClick={() => { setOtpSent(false); setOtpStage('none'); setOtpCode(''); }}>Cancel</Button>
                  </div>
                </div>
              )}

              {/* Submit */}
              {!otpSent && (
                <Button type="submit" className="w-full h-12 rounded-xl" disabled={isLoading}>
                  <ArrowRight className="w-5 h-5 mr-2" />
                  {isPhoneMode ? (isLogin ? 'Send OTP' : 'Send OTP to Sign Up') : (isLogin ? 'Login' : 'Create Account')}
                </Button>
              )}
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;

 
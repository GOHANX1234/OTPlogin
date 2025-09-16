import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Lock, UserCheck, Mail, Shield } from "lucide-react";

// Audio utility function for login errors
const playLoginErrorSound = () => {
  try {
    const audio = new Audio('/sounds/login-error.mp3');
    audio.volume = 0.7;
    audio.play().catch(error => console.log('Audio play failed:', error));
  } catch (error) {
    console.log('Audio creation failed:', error);
  }
};

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type LoginValues = z.infer<typeof loginSchema>;
type OTPValues = z.infer<typeof otpSchema>;

export default function Login() {
  const [activeTab, setActiveTab] = useState<"admin" | "reseller">("admin");
  const [showOTP, setShowOTP] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isOTPLoading, setIsOTPLoading] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const adminForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const resellerForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const otpForm = useForm<OTPValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Step 1: Verify admin credentials and send OTP
  async function onAdminSubmit(values: LoginValues) {
    try {
      console.log('Starting admin login step 1...');
      
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.requiresOTP) {
        // Credentials verified, OTP sent
        setMaskedEmail(data.email);
        setShowOTP(true);
        
        toast({
          title: "Verification Code Sent",
          description: `Please check your email (${data.email}) for the 6-digit verification code`,
          duration: 5000,
        });
        
        console.log('✅ OTP step initiated successfully');
      } else {
        // This shouldn't happen with new flow, but handle it just in case
        toast({
          title: "Success",
          description: "Logged in as admin successfully",
        });
      }
    } catch (error: any) {
      console.log('Caught error in onAdminSubmit:', error);
      
      // Play login error sound
      playLoginErrorSound();
      
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login",
        variant: "destructive",
        duration: 10000,
      });
    }
  }
  
  // Step 2: Verify OTP and complete login
  async function onOTPSubmit(values: OTPValues) {
    try {
      setIsOTPLoading(true);
      console.log('Starting OTP verification...');
      
      const response = await fetch('/api/auth/admin/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
      
      // OTP verified successfully, user should be logged in
      toast({
        title: "Success",
        description: "Logged in as admin successfully",
      });
      
      console.log('✅ Admin login completed successfully');
      
      // Reset forms and state
      adminForm.reset();
      otpForm.reset();
      setShowOTP(false);
      setMaskedEmail("");
      
      // Force refresh auth state
      window.location.reload();
      
    } catch (error: any) {
      console.log('Caught error in onOTPSubmit:', error);
      
      // Play login error sound
      playLoginErrorSound();
      
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
        duration: 10000,
      });
      
      // Reset OTP field on error
      otpForm.reset();
    } finally {
      setIsOTPLoading(false);
    }
  }

  async function onResellerSubmit(values: LoginValues) {
    try {
      await login("reseller", values.username, values.password);
      toast({
        title: "Success",
        description: "Logged in as reseller successfully",
      });
    } catch (error: any) {
      console.log('Caught error in onResellerSubmit:', error);
      console.log('Error message for toast:', error.message);
      
      // Play login error sound
      playLoginErrorSound();
      
      // Add alert as backup to test visibility
      alert("LOGIN ERROR: " + (error.message || "Failed to login"));
      
      toast({
        title: "Login Failed", 
        description: error.message || "Failed to login",
        variant: "destructive",
        duration: 10000, // Show for 10 seconds
      });
      console.log('Toast function called with description:', error.message || "Failed to login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 bg-gradient-to-br from-background via-background to-purple-950/20 moving-glow">
      <Card className="max-w-md w-full border border-purple-500/30 shadow-xl shadow-purple-500/10 backdrop-blur-sm bg-background/80 form-border-glow relative z-10">
        <CardContent className="pt-6">
          <div className="text-center mb-8 float">
            <h1 className="text-4xl font-bold text-primary bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent pb-1 glow-text shine-effect">DEXX-TER</h1>
            <p className="text-muted-foreground mt-2">Professional License Management</p>
          </div>

          <Tabs defaultValue="admin" onValueChange={(value) => setActiveTab(value as "admin" | "reseller")}>
            <div className="flex justify-center mb-4">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-background/80 p-1 border border-purple-500/20">
                <TabsTrigger 
                  value="admin" 
                  className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:shadow-none px-4 py-1.5 text-sm font-medium"
                >
                  Admin
                </TabsTrigger>
                <TabsTrigger 
                  value="reseller" 
                  className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300 data-[state=active]:shadow-none px-4 py-1.5 text-sm font-medium"
                >
                  Reseller
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="admin">
              {!showOTP ? (
                // Step 1: Credential verification
                <Form {...adminForm}>
                  <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                    <FormField
                      control={adminForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" aria-hidden="true" />
                              <Input 
                                placeholder="Enter admin username" 
                                className="pl-10" 
                                {...field} 
                                data-testid="input-admin-username"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={adminForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" aria-hidden="true" />
                              <Input 
                                type="password" 
                                placeholder="Enter admin password" 
                                className="pl-10" 
                                {...field} 
                                data-testid="input-admin-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 relative" 
                      disabled={isLoading}
                      data-testid="button-admin-login"
                    >
                      {isLoading ? "Verifying..." : "Verify Credentials"}
                    </Button>
                  </form>
                </Form>
              ) : (
                // Step 2: OTP verification
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/20 rounded-full">
                      <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Email Verification</h3>
                    <p className="text-sm text-muted-foreground">
                      A 6-digit verification code has been sent to
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-purple-400">{maskedEmail}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Code expires in 1 minute
                    </p>
                  </div>
                  
                  <Form {...otpForm}>
                    <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-center block">Verification Code</FormLabel>
                            <FormControl>
                              <div className="flex justify-center">
                                <InputOTP
                                  maxLength={6}
                                  value={field.value}
                                  onChange={field.onChange}
                                  data-testid="input-admin-otp"
                                >
                                  <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                  </InputOTPGroup>
                                </InputOTP>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowOTP(false);
                            setMaskedEmail("");
                            otpForm.reset();
                          }}
                          className="flex-1"
                          data-testid="button-admin-back"
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500" 
                          disabled={isOTPLoading}
                          data-testid="button-admin-verify-otp"
                        >
                          {isOTPLoading ? "Verifying..." : "Verify & Login"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reseller">
              <Form {...resellerForm}>
                <form onSubmit={resellerForm.handleSubmit(onResellerSubmit)} className="space-y-4">
                  <FormField
                    control={resellerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" aria-hidden="true" />
                            <Input 
                              placeholder="Enter reseller username" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resellerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" aria-hidden="true" />
                            <Input 
                              type="password" 
                              placeholder="Enter reseller password" 
                              className="pl-10" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 relative" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login as Reseller"}
                  </Button>
                </form>
              </Form>

              <div className="text-center mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Don't have an account?</p>
                <Button 
                  variant="link" 
                  className="mt-1 text-purple-400 hover:text-purple-300 glow-text"
                  onClick={() => window.location.href = "/register"}
                >
                  Register with Referral Token
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

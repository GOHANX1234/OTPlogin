import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Lock, 
  UserCheck, 
  User, 
  MailCheck, 
  ShieldCheck,
  LogIn,
  UserPlus
} from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["admin", "reseller"]).default("reseller")
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  referralToken: z.string().min(4, "Referral token is required")
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, isAuthenticated, login, register } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("login");

  // If user is already logged in, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    return <Redirect to={user.role === "admin" ? "/admin" : "/reseller"} />;
  }

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "reseller"
    }
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      referralToken: ""
    }
  });

  const onLoginSubmit = async (values: LoginValues) => {
    try {
      await login(values.role, values.username, values.password);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not login. Please check your credentials.",
        variant: "destructive"
      });
    }
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    try {
      await register(values.username, values.password, values.referralToken);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Could not register. Please check your information.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiI+CjxyZWN0IHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgZmlsbD0iIzAwMDAwMCI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjNGEyNDgwIiBmaWxsLW9wYWNpdHk9IjAuMDIiPjwvcmVjdD4KPC9zdmc+')] bg-black before:fixed before:inset-0 before:bg-gradient-to-b before:from-black/5 before:via-purple-900/5 before:to-black/5 before:z-[-1] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -top-[100px] -left-[100px] bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute w-[500px] h-[500px] top-[10%] right-[10%] bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute w-[500px] h-[500px] bottom-0 left-[30%] bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 border-glow rounded-xl overflow-hidden shadow-2xl shadow-purple-900/30">
        {/* Left Column - Form */}
        <div className="bg-black/80 backdrop-blur-md p-8 rounded-l-xl border border-purple-500/20">
          <div className="flex items-center mb-10 justify-center sm:justify-start">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent glow-text stable-text">DEXX-TER</h1>
            <span className="ml-3 px-3 py-1 bg-purple-900/30 text-purple-300 text-xs rounded-md border border-purple-500/30 stable-text">
              License System
            </span>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-black/30 border border-purple-500/20 p-1 rounded-lg">
              <TabsTrigger value="login" className="data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-purple-500/30 data-[state=active]:border rounded-md transition-all">
                <LogIn className="h-4 w-4 mr-2" /> Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-purple-500/30 data-[state=active]:border rounded-md transition-all">
                <UserPlus className="h-4 w-4 mr-2" /> Register
              </TabsTrigger>
            </TabsList>

            {/* Login Content */}
            <TabsContent value="login">
              <Card className="border-2 border-purple-500/70 bg-black/60 shadow-xl shadow-purple-900/20 form-border-glow rounded-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-white stable-text">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-400 stable-text">Login to manage your license keys</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                      <FormField
                        control={loginForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Login As</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                type="button" 
                                variant={field.value === "admin" ? "default" : "outline"}
                                className={field.value === "admin" 
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/30 border-0 transition-all"
                                  : "hover:bg-purple-900/30 border-purple-500/30 hover:text-white transition-all"
                                } 
                                onClick={() => loginForm.setValue("role", "admin")}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" /> Admin
                              </Button>
                              <Button 
                                type="button" 
                                variant={field.value === "reseller" ? "default" : "outline"}
                                className={field.value === "reseller" 
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/30 border-0 transition-all"
                                  : "hover:bg-purple-900/30 border-purple-500/30 hover:text-white transition-all"
                                } 
                                onClick={() => loginForm.setValue("role", "reseller")}
                              >
                                <User className="h-4 w-4 mr-2" /> Reseller
                              </Button>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-gray-300">Username</FormLabel>
                            <FormControl>
                              <div className="relative input-border-glow rounded-md">
                                <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" />
                                <Input 
                                  placeholder="Enter your username" 
                                  className="pl-10 bg-black/90 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-inner transition-all rounded-md" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-gray-300">Password</FormLabel>
                            <FormControl>
                              <div className="relative input-border-glow rounded-md">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" />
                                <Input 
                                  type="password" 
                                  placeholder="Enter your password" 
                                  className="pl-10 bg-black/90 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-inner transition-all rounded-md" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6 mt-4 border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                        disabled={loginForm.formState.isSubmitting}
                      >
                        {loginForm.formState.isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Logging in...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <LogIn className="h-5 w-5 mr-2" /> Login
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-purple-500/10 pt-4">
                  <p className="text-sm text-gray-400">
                    Don't have an account?{" "}
                    <button 
                      onClick={() => setActiveTab("register")} 
                      className="text-purple-400 hover:text-purple-300 hover:underline font-medium"
                    >
                      Register here
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Register Content */}
            <TabsContent value="register">
              <Card className="border-2 border-purple-500/70 bg-black/60 shadow-xl shadow-purple-900/20 form-border-glow rounded-lg">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-white stable-text">Create Account</CardTitle>
                  <CardDescription className="text-gray-400 stable-text">Register as a reseller using your referral token</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-gray-300">Username</FormLabel>
                            <FormControl>
                              <div className="relative input-border-glow rounded-md">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" />
                                <Input 
                                  placeholder="Choose a username" 
                                  className="pl-10 bg-black/90 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-inner transition-all rounded-md"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-gray-300">Password</FormLabel>
                            <FormControl>
                              <div className="relative input-border-glow rounded-md">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" />
                                <Input 
                                  type="password" 
                                  placeholder="Create a password" 
                                  className="pl-10 bg-black/90 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-inner transition-all rounded-md"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="referralToken"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-gray-300">Referral Token</FormLabel>
                            <FormControl>
                              <div className="relative input-border-glow rounded-md">
                                <MailCheck className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" />
                                <Input 
                                  placeholder="Enter your referral token" 
                                  className="pl-10 bg-black/90 border-transparent focus-visible:border-transparent focus-visible:ring-0 shadow-inner transition-all rounded-md"
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6 mt-4 border-0 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                        disabled={registerForm.formState.isSubmitting}
                      >
                        {registerForm.formState.isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                            Registering...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <UserPlus className="h-5 w-5 mr-2" /> Register
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-purple-500/10 pt-4">
                  <p className="text-sm text-gray-400">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setActiveTab("login")} 
                      className="text-purple-400 hover:text-purple-300 hover:underline font-medium"
                    >
                      Login here
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Hero */}
        <div className="hidden lg:block bg-gradient-to-br from-purple-900/40 via-indigo-900/20 to-black relative overflow-hidden rounded-r-xl border border-purple-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMTI4LCA5MCwgMjEzLCAwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
          
          {/* Animated background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-[300px] h-[300px] top-[-10%] right-[-10%] bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute w-[250px] h-[250px] bottom-[-10%] left-[-10%] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-center">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20">
                <div className="inline-block p-3 rounded-full bg-purple-900/40 border border-purple-500/30 mb-6 shadow-lg shadow-purple-500/20">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent mb-4">Advanced License Management System</h2>
                <p className="text-gray-400 mb-6">Generate, track, and manage game license keys with a powerful admin interface and reseller functionality.</p>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/40">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    Multiple games supported
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/40">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    Device tracking and management
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/40">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    Reseller credit system
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 border border-purple-500/40">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    Complete license tracking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
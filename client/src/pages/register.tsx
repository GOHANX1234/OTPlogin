import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCheck, Lock, MailCheck } from "lucide-react";

// Audio utility function for registration errors
const playRegistrationErrorSound = () => {
  try {
    const audio = new Audio('/sounds/registration-error.mp3');
    audio.volume = 0.7;
    audio.play().catch(error => console.log('Audio play failed:', error));
  } catch (error) {
    console.log('Audio creation failed:', error);
  }
};

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralToken: z.string().min(1, "Referral token is required"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function Register() {
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      referralToken: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    try {
      await register(values.username, values.password, values.referralToken);
      toast({
        title: "Success",
        description: "Account registered successfully",
      });
    } catch (error: any) {
      console.log('Caught error in registration:', error);
      console.log('Error message for registration:', error.message);
      
      // Play registration error sound
      playRegistrationErrorSound();
      
      // Show browser popup for invalid referral token
      alert("REGISTRATION ERROR: " + (error.message || "Failed to register"));
      
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register",
        variant: "destructive",
        duration: 10000, // Show for 10 seconds
      });
      console.log('Registration toast called with description:', error.message || "Failed to register");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 bg-gradient-to-br from-background via-background to-purple-950/20 moving-glow">
      <Card className="max-w-md w-full border border-purple-500/30 shadow-xl shadow-purple-500/10 backdrop-blur-sm bg-background/80 form-border-glow relative z-10">
        <CardContent className="pt-6">
          <div className="text-center mb-8 float">
            <h1 className="text-4xl font-bold text-primary bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent pb-1 glow-text shine-effect">DEXX-TER</h1>
            <p className="text-muted-foreground mt-2">Reseller Registration</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" aria-hidden="true" />
                        <Input 
                          placeholder="Choose a username" 
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
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" aria-hidden="true" />
                        <Input 
                          type="password" 
                          placeholder="Choose a password" 
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
                control={form.control}
                name="referralToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Token</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MailCheck className="absolute left-3 top-2.5 h-5 w-5 text-purple-400 z-10" aria-hidden="true" />
                        <Input 
                          placeholder="Enter your referral token" 
                          className="pl-10" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 relative" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Account"}
              </Button>

              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  className="text-purple-400 hover:text-purple-300 glow-text"
                  onClick={() => window.location.href = "/"}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useContext, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HomeIcon, PersonIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/context/theme-provider";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { AuthContext } from "@/components/context/authContext";
import { Code2, UserPlus } from "lucide-react";

const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username must be at most 20 characters long" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message:
        "Username can only contain alphanumeric characters and underscores",
    })
    .trim()
    .toLowerCase(),

  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password must be at most 100 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
      }
    ),

  fullname: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters long" })
    .max(30, { message: "Full name must be at most 30 characters long" })
    .trim(),
});

const SignUpPage = () => {
  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullname: "",
    },
  });

  const { login } = useContext(AuthContext)
  const navigate = useNavigate();

  async function onSubmit(values) {
    console.log(values);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/signup`,
        values
      );
      console.log(response);

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      login(response.data.createdUser.username, response.data.createdUser._id)

      toast.success(`${response.data.createdUser.username}, ${response.data.message}`);
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.message || "Network Error: Cannot connect to server. Is the backend running?";
      toast.error(errorMessage);
    }
  }

  const handleGoogleSignIn = () => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      callback: async (response) => {
        if (response.access_token) {
          try {
            const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });

            const userResponse = await axios.post(
              `${import.meta.env.VITE_BASE_URL}/auth/google-signin`,
              {
                token: response.access_token,
                userInfo: userInfo.data
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            localStorage.setItem('accessToken', userResponse.data.accessToken);
            localStorage.setItem('refreshToken', userResponse.data.refreshToken);

            login(userResponse.data.user.username, userResponse.data.user._id);

            toast.success(`${userResponse.data.user.username}, ${userResponse.data.message}`);
            navigate("/", { replace: true });
          } catch (error) {
            console.error('Google Sign-In Error:', error.response?.data || error.message);
            toast.error(`An error occurred during Google Sign-In: ${error.response?.data?.message || error.message}`);
          }
        }
      },
    });

    client.requestAccessToken();
  };



  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <Toaster closeButton="true" richColors="true" position="top-center" />

      {/* Top Navigation */}
      <div className="relative auth-top-nav w-full flex justify-between px-6 py-4 items-center">
        <Link to={"/"}>
          <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10 hover:border-primary">
            <HomeIcon />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="font-bold gradient-text">CodeYourWay</span>
        </div>
        <ModeToggle />
      </div>

      {/* Sign Up Card */}
      <div className="relative flex items-center justify-center px-4 py-4">
        <Card className="max-w-md w-full card-glow border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join the community of developers
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Choose a username"
                          className="border-border focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="border-border focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          className="border-border focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
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
                      <FormLabel className="text-foreground">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          className="border-border focus:border-primary focus:ring-primary/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Must contain uppercase, lowercase, number & special character
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full gradient-bg text-white hover:opacity-90 btn-glow h-11 text-base font-semibold" type="submit">
                  Create Account
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-border hover:bg-secondary/50 h-11"
                  onClick={handleGoogleSignIn}
                >
                  <img
                    width="24"
                    height="24"
                    src="https://img.icons8.com/fluency/48/google-logo.png"
                    alt="google-logo"
                    className="mr-2"
                  />
                  Sign up with Google
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      {/* Login Link */}
      <p className="text-center text-muted-foreground pb-8">
        Already have an account?{" "}
        <Link to={"/login"} className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;

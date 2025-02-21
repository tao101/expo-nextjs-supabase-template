"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { emailSchema } from "@shared/zodSchemas/authSchema";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { supabaseClient } from "@/services/supabase/createSupabaseClient";
import { useState } from "react";
import { toast } from "sonner";
import getErrorMessage from "@shared/utils/getErrorMessage";
import { z } from "zod";

// Create a schema just for the reset password form
const resetPasswordSchema = z.object({
  email: emailSchema,
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset-password/update-password`,
        }
      );

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success("Password reset link sent to your email");
    } catch (error: unknown) {
      console.error("error resetting password", error);
      const message = getErrorMessage(error);
      setError(message);
      toast.error("Error resetting password: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a link to reset your
          password
        </p>
      </div>

      {isSuccess ? (
        <div className="grid gap-6">
          <div className="rounded-lg bg-muted p-6 text-center">
            <p className="mb-2 text-sm">Check your email</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent you a link to reset your password. Please check
              your spam folder if you don&apos;t see it in your inbox.
            </p>
          </div>
          <Button asChild>
            <Link href="/signin">Back to Sign In</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="m@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            disabled={isLoading}
            type="submit"
            className="w-full disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </Button>

          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/signin" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </form>
  );
}

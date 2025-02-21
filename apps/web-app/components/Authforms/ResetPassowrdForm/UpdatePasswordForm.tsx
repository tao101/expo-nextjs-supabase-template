"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema } from "@shared/zodSchemas/authSchema";
import { useForm } from "react-hook-form";
import { supabaseClient } from "@/services/supabase/createSupabaseClient";
import { useState } from "react";
import { toast } from "sonner";
import getErrorMessage from "@shared/utils/getErrorMessage";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Create a schema for password update that requires password confirmation
const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UpdatePasswordSchema) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabaseClient.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("error updating password", error);
      const message = getErrorMessage(error);
      setError(message);
      toast.error("Error updating password: " + message);
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
        <h1 className="text-2xl font-bold">Update Password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            {...register("password")}
            id="password"
            type="password"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            {...register("confirmPassword")}
            id="confirmPassword"
            type="password"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
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
              Updating...
            </div>
          ) : (
            "Update Password"
          )}
        </Button>
      </div>
    </form>
  );
}

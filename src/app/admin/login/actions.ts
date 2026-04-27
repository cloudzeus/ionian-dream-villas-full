"use server"
import { signIn } from "@/lib/auth"
import { AuthError } from "next-auth"

export async function loginAction(_prev: unknown, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/admin",
    })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Invalid email or password" }
    }
    // Auth.js throws NEXT_REDIRECT on success — re-throw so Next.js handles it
    throw e
  }
}

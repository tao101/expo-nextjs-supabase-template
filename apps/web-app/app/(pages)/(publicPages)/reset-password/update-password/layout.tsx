import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Password",
  description: "Update your password",
};

export default async function UpdatePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

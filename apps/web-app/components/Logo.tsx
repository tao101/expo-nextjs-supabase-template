import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export default function Logo() {
  return (
    <div className="flex justify-center gap-2 md:justify-start">
      <Link href="/" className="flex items-center gap-2 font-medium">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GalleryVerticalEnd className="size-4" />
        </div>
        Community
      </Link>
    </div>
  );
}

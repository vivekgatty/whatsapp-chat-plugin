// web/src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // choose one:
  redirect("/dashboard");
  // redirect("/dashboard");
}

import { notFound } from "next/navigation";

export default function CatchAll() {
  // Catch all unmatched routes, trigger 404 page
  notFound();
}


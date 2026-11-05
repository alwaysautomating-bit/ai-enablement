import type { Metadata } from "next";
import { ContextCapture } from "@/components/context-capture";

export const metadata: Metadata = {
  title: "Understand how something works · AI Enablement Workspace",
  description: "Reconstruct how work actually happens from email and chat, then confirm what is true.",
};

export default function ContextPage() {
  return <ContextCapture />;
}

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Send } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Tell us a little more").max(1000),
});

export function InquiryForm({ defaultMessage = "" }: { defaultMessage?: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: defaultMessage,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    const { error } = await supabase.from("inquiries").insert({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
    });
    setSaving(false);
    if (error) {
      toast.error("Couldn't send your message. Please try again.");
      return;
    }
    toast.success("Thanks! We'll get back to you shortly.");
    setForm({ name: "", phone: "", email: "", message: "" });
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="iq-name">Name</Label>
          <Input id="iq-name" maxLength={100} {...field("name")} placeholder="Your name" />
          {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="iq-phone">Phone (optional)</Label>
          <Input id="iq-phone" maxLength={30} {...field("phone")} placeholder="98…" />
          {errors["phone"] && <p className="text-xs text-destructive">{errors["phone"]}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="iq-email">Email (optional)</Label>
        <Input
          id="iq-email"
          type="email"
          maxLength={255}
          {...field("email")}
          placeholder="you@example.com"
        />
        {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="iq-message">Message</Label>
        <Textarea
          id="iq-message"
          rows={4}
          maxLength={1000}
          {...field("message")}
          placeholder="What would you like to know?"
        />
        {errors["message"] && <p className="text-xs text-destructive">{errors["message"]}</p>}
      </div>
      <Button type="submit" variant="hero" disabled={saving}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {saving ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}

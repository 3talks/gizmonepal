import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Container, SectionHeading } from "@/components/site/Section";
import { InquiryForm } from "@/components/site/InquiryForm";
import { Button } from "@/components/ui/button";
import { STORE, whatsappLink } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Gizmo Nepal — Visit or Message the Store" },
      {
        name: "description",
        content:
          "Store address, opening hours, phone, WhatsApp and an inquiry form to check product availability at Gizmo Nepal.",
      },
      { property: "og:title", content: "Contact Gizmo Nepal" },
      {
        property: "og:description",
        content: "Call, WhatsApp or message us to check stock before you visit the showroom.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const details = [
    { icon: MapPin, label: "Address", value: STORE.address },
    { icon: Phone, label: "Phone", value: STORE.phone, href: `tel:${STORE.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: STORE.email, href: `mailto:${STORE.email}` },
    { icon: Clock, label: "Hours", value: STORE.hours },
  ];

  return (
    <Container className="py-14">
      <SectionHeading
        eyebrow="Get in touch"
        title="Contact the showroom"
        description="Check availability, ask for a price or reserve an item for pickup. We reply fastest on WhatsApp."
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <detail.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{detail.label}</p>
                {detail.href ? (
                  <a href={detail.href} className="text-sm font-medium hover:text-primary">
                    {detail.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium">{detail.value}</p>
                )}
              </div>
            </div>
          ))}

          <Button asChild variant="hero" size="lg" className="w-full">
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chat on WhatsApp
            </a>
          </Button>

          <div className="overflow-hidden rounded-2xl border border-border">
            <iframe
              src={STORE.mapEmbed}
              title={`Map showing ${STORE.name} location`}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We usually respond within a few hours during opening times.
          </p>
          <div className="mt-6">
            <InquiryForm />
          </div>
        </div>
      </div>
    </Container>
  );
}

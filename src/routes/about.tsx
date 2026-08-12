import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Container, SectionHeading } from "@/components/site/Section";
import { Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { STORE } from "@/lib/store";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PulseGear — Our Accessory Showroom" },
      {
        name: "description",
        content:
          "PulseGear is a physical gadget and accessory showroom. Learn how we pick stock, support warranties and help customers choose the right gear.",
      },
      { property: "og:title", content: "About PulseGear" },
      {
        property: "og:description",
        content: "How our showroom works and why customers shop with us in person.",
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Authorised stock only",
    body: "We buy through official distributors, so warranty claims are handled locally without shipping items abroad.",
  },
  {
    icon: Sparkles,
    title: "Curated, not cluttered",
    body: "Instead of thousands of listings, we stock a tight selection that we've personally tested and would use ourselves.",
  },
  {
    icon: Users,
    title: "Advice over upselling",
    body: "Tell us your phone, camera or bike setup and your budget — we'll point you at the accessory that actually fits.",
  },
];

function AboutPage() {
  return (
    <>
      <section className="hero-bg">
        <Container className="py-20">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              About us
            </p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              A showroom for people who care about their gear
            </h1>
            <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              {STORE.name} started as a small counter fixing charging cables and grew into a
              full accessory showroom. This website is our live catalog — everything you see
              here is what sits on our shelves. There's no cart and no checkout: browse,
              shortlist, then come in and try it.
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="glass rounded-2xl p-6">
              <value.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">{value.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="pb-20">
        <SectionHeading
          eyebrow="Come say hi"
          title="Where to find us"
          action={
            <Button asChild variant="hero">
              <Link to="/contact">Contact details</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="mt-4 text-sm font-semibold">Showroom</h3>
            <p className="mt-2 text-sm text-muted-foreground">{STORE.address}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            <h3 className="mt-4 text-sm font-semibold">Opening hours</h3>
            <p className="mt-2 text-sm text-muted-foreground">{STORE.hours}</p>
          </div>
        </div>
      </Container>
    </>
  );
}

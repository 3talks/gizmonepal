import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, Zap } from "lucide-react";
import { STORE } from "@/lib/store";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Zap className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold">{STORE.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {STORE.description} Visit our counter to see, test and compare everything in
            person — no online ordering, just honest advice and genuine stock.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Browse</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-foreground">
                All products
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-foreground">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/brands" className="hover:text-foreground">
                Brands
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About the store
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Visit us</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {STORE.address}
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${STORE.phone.replace(/\s/g, "")}`}>{STORE.phone}</a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              {STORE.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {STORE.name}. Showroom catalog — prices shown are
            indicative.
          </p>
          <Link to="/auth" className="hover:text-foreground">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}

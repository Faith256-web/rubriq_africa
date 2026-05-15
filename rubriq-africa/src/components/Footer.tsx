// Footer with company info + social links.

import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-linear-to-r from-green-950 via-green-900 to-orange-900 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        {/* Company Info */}
        <div className="md:col-span-2">
          <h3 className="text-3xl font-bold text-orange-400">Rubriq Africa</h3>

          <p className="mt-3 max-w-md text-sm text-white/80">
            Building Uganda with sustainable bricks, pavers and blocks. One year of trusted
            craftsmanship, eco-conscious materials,and reliable delivery across the country.
          </p>

          {/* Socials */}
          <div className="mt-5 flex gap-3">
            {[
              {
                Icon: Facebook,
                link: "https://facebook.com/rubriqafrica",
                label: "Facebook",
              },
              {
                Icon: Instagram,
                link: "https://instagram.com/rubriqafrica",
                label: "Instagram",
              },
              {
                Icon: Twitter,
                link: "https://twitter.com/rubriqafrica",
                label: "Twitter",
              },
              {
                Icon: Linkedin,
                link: "https://linkedin.com/company/rubriqafrica",
                label: "LinkedIn",
              },
            ].map(({ Icon, link, label }, i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-orange-500"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        {/* ✅ CLOSED Company Info div here */}

        {/* Explore Links */}
        <div>
          <h4 className="mb-3 text-lg font-semibold text-orange-300">Explore</h4>

          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link to="/" className="transition hover:text-orange-300">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition hover:text-orange-300">
                About
              </Link>
            </li>
            <li>
              <Link to="/products" className="transition hover:text-orange-300">
                Products
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-orange-300">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="mb-3 text-lg font-semibold text-orange-300">Reach Us</h4>

          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-400" />
              Mbale, Uganda
            </li>

            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-400" />
              +256 700 000 000
            </li>

            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-400" />
              info@rubriq.africa
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Rubriq Africa. All rights reserved.
      </div>
    </footer>
  );
}

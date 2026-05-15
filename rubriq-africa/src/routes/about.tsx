// About page — company background, mission, vision.

import { createFileRoute } from "@tanstack/react-router";
import bg from "@/assets/bg-team.jpg";
import { Target, Eye, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About Rubriq Africa Our Story, Mission & Vision",
      },
      {
        name: "description",
        content:
          "Founded in 2025 in Uganda, Rubriq Africa makes sustainable bricks and pavers from local and recycled materials.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-green-950">
        <img
          src={bg}
          alt="Rubriq Africa team on site"
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={900}
          loading="lazy"
        />

        {/* Green overlay for brand consistency */}
        <div className="absolute inset-0 bg-green-900/60" />

        {/* Orange accent glow */}
        <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay" />

        {/* Content */}
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
          <h1 className="font-display text-5xl font-bold sm:text-6xl">About Us</h1>

          <p className="mx-auto mt-4 max-w-2xl opacity-95">
            One year of building Uganda sustainably, locally and with pride.
          </p>
        </div>
      </section>

      {/* BACKGROUND SECTION */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-display text-3xl font-bold">Our background</h2>

        <p className="mt-4 text-muted-foreground">
          Rubriq Africa was founded in 2025 in Mbale, Plot 6 Nsoba Lane. We are tackling Uganda's
          urban waste problem through recycling and sustainable engineering.
        </p>

        <p className="mt-4 text-muted-foreground">
          In our first year we've supplied thousands of bricks and pavers across Uganda, partnered
          with contractors big and small, and proven that sustainability and quality can grow
          together.
        </p>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section className="bg-green-50 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 md:grid-cols-3">
          {[
            {
              Icon: Target,
              t: "Mission",
              d: "To reduce urban waste pollution by transforming discarded vehicle tires into durable construction materials.",
            },
            {
              Icon: Eye,
              t: "Vision",
              d: "To see a Uganda where waste is treated as an economic resource for sustainable development.",
            },
            {
              Icon: Sparkles,
              t: "Values",
              d: "Quality, sustainability, and integrity in every brick we make and every relationship we build.",
            },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-2xl bg-white p-6 shadow-md border border-green-100">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-500 text-white">
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-display text-xl font-semibold">{t}</h3>

              <p className="mt-2 text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

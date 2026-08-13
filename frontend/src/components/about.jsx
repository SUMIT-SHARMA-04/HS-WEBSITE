import { useState } from 'react';
import { Leaf, Award, UtensilsCrossed, ArrowRight } from 'lucide-react';

const tabs = [
  {
    key: 'veg',
    icon: Leaf,
    title: 'Pure Veg',
    desc: 'Every dish on our menu is crafted with 100% vegetarian ingredients. We source fresh produce from trusted local farms and never compromise on the purity or quality of what reaches your plate. Our kitchen is entirely meat-free, ensuring a clean and wholesome dining experience.',
    points: ['100% vegetarian kitchen', 'Fresh farm-sourced produce', 'No artificial additives'],
  },
  {
    key: 'premium',
    icon: Award,
    title: 'Premium Quality',
    desc: 'From sourcing to plating, we hold every detail to an exacting standard. Our chefs combine classical technique with modern artistry, and every plate is finished with precision — because our guests deserve nothing less than excellence, every single visit.',
    points: ['Classical French technique', 'Hand-selected premium ingredients', 'Meticulous presentation'],
  },
];

export default function About() {
  const [active, setActive] = useState('veg');
  const current = tabs.find((t) => t.key === active);

  return (
    <section id="about" className="py-24 bg-cream-50 relative overflow-hidden">
      {/* Decorative gold orb */}
      <div className="absolute top-32 right-0 w-80 h-80 bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16" data-reveal>
          <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.25em] mb-3">
            Our Story
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-brown-900 mb-4">
            A Legacy of Flavor
          </h2>
          <div className="w-16 gold-divider mx-auto" />
        </div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
          {/* Image with floating badge */}
          <div className="relative" data-reveal>
            <img
              src="https://images.pexels.com/photos/4253300/pexels-photo-4253300.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Our chefs at work"
              className="w-full h-[460px] object-cover rounded-2xl shadow-xl"
            />
            {/* Floating "Since 2022" badge */}
            <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-gold-300 to-gold-500 rounded-2xl p-6 shadow-2xl animate-float hidden md:block">
              <p className="font-serif text-2xl font-bold text-brown-900 leading-tight">Since</p>
              <p className="font-serif text-5xl font-bold text-brown-900 leading-none mt-1">2022</p>
              <div className="w-10 h-0.5 bg-brown-800/40 mt-2" />
            </div>
          </div>

          {/* Right — story + tabs + CTA */}
          <div data-reveal>
            <p className="text-brown-700 text-lg leading-relaxed mb-6">
              High Spirits Cafe & Restaurant was founded in 2022 with a singular vision — to create a
              dining destination where exceptional food, warm hospitality, and an
              inviting atmosphere come together in perfect harmony.
            </p>
            <p className="text-brown-600 leading-relaxed mb-8">
              Our philosophy is simple — take the finest seasonal ingredients,
              treat them with respect, and let their natural beauty shine. Every
              menu evolves with the seasons, ensuring each visit brings something
              new to discover.
            </p>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = active === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActive(tab.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive ? 'tab-active' : 'tab-inactive'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.title}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="bg-white border border-cream-200 rounded-2xl p-6 mb-8">
              <p className="text-brown-600 leading-relaxed text-sm mb-4">
                {current?.desc}
              </p>
              <ul className="space-y-2">
                {current?.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-brown-700 text-sm">
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Explore menu button */}
            <a
              href="#menu"
              className="btn-gold inline-flex items-center gap-2 font-medium px-7 py-3.5 rounded-full shadow-lg"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Explore Our Menu
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
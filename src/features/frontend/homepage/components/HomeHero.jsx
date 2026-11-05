import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, ShieldCheck, Wrench, Clock, Wallet } from 'lucide-react';
import { STORE_ROUTES } from '../../storeConfig';

const HERO = {
  eyebrow: 'BACK TO CAMPUS · ENDS 23 SEP',
  title: '15% off laptops and everything that plugs into them.',
  text: 'Free same-day delivery in Phnom Penh over $50. Pick up in any of our 4 stores in 30 minutes.',
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Genuine stock', text: 'Official distributor' },
  { icon: Wrench, title: '1-year warranty', text: 'Local service centre' },
  { icon: Clock, title: 'Pickup in 30 min', text: '4 branches' },
  { icon: Wallet, title: 'Pay your way', text: 'KHQR · ABA · Card · Cash' },
];

export function HomeHero() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="home-hero-eyebrow">{HERO.eyebrow}</div>
          <h1>{HERO.title}</h1>
          <p>{HERO.text}</p>
          <div className="home-hero-actions">
            <Link to={STORE_ROUTES.SHOP} className="store-btn store-btn-primary">
              Shop the sale
            </Link>
            <Link to={STORE_ROUTES.STORES} className="store-btn store-btn-ghost">
              Find a store
            </Link>
          </div>
        </div>
        <div className="home-hero-visual" aria-hidden="true">
          <Laptop size={96} strokeWidth={1.2} />
        </div>
      </section>

      <section className="home-trust">
        {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="home-trust-item">
            <Icon size={18} className="home-trust-icon" />
            <div>
              <div className="home-trust-title">{title}</div>
              <div className="home-trust-text">{text}</div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

export default HomeHero;

import React from 'react';
import { Fish, Trophy, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const AprilFoolsBanner = () => {
  const badges = [
    { icon: "🐳", name: "Mégaleodon", rank: "1er" },
    { icon: "🦈", name: "Requin Marteau", rank: "2ème" },
    { icon: "🐡", name: "Bar Agile", rank: "3ème" },
    { icon: "🐠", name: "Sardine Étincelante", rank: "4ème" },
    { icon: "🐟", name: "Friture", rank: "5ème" },
  ];

  return (
    <div className="april-fools-banner glass-premium" style={{
      background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
      color: 'white',
      borderRadius: '24px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }}>
      {/* Decorative Fish */}
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, transform: 'rotate(-20deg)' }}>
        <Fish size={120} />
      </div>
      <div style={{ position: 'absolute', bottom: '-20px', left: '10px', opacity: 0.1, transform: 'rotate(15deg)' }}>
        <Fish size={80} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '8px', borderRadius: '12px' }}>
            <Fish size={24} className="animate-bounce" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Poisson d'Avril ! 🐟
          </h2>
        </div>

        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', opacity: 0.9, lineHeight: 1.4 }}>
          Aujourd'hui, chaque répétition compte pour le classement spécial ! Les 5 plus gros volumes de la ligue décrochent les titres légendaires :
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
          {badges.map((b, i) => (
            <div key={i} className="glass" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 12px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ opacity: 0.7, fontSize: '0.6rem' }}>{b.rank}</span>
                <span>{b.name}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/league?tab=CLASSEMENT" style={{
            flex: 1,
            background: 'white',
            color: '#2563eb',
            padding: '12px',
            borderRadius: '14px',
            fontSize: '0.85rem',
            fontWeight: 900,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            <Trophy size={16} /> VOIR LE CLASSEMENT
          </Link>
          <Link href="/faq#evenements" style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '12px',
            borderRadius: '14px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Info size={18} />
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce {
          animation: bounce 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AprilFoolsBanner;

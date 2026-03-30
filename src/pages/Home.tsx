import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { dbService } from '../store/db.ts';
import type { CyclingEvent } from '../store/db.ts';


const Home: React.FC = () => {
  const [events, setEvents] = React.useState<CyclingEvent[]>([]);

  React.useEffect(() => {
    dbService.getEvents().then(data => {
      setEvents(data.filter(e => e.status === 'upcoming'));
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

  return (
    <div className="animate-fade-in">
      <section className="hero" style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.2)), url("https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '8rem 0 10rem 0',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container text-center">
          <span className="badge badge-primary mb-4 delay-1" style={{ fontSize: '0.9rem' }}>Aventuras & Amizade</span>
          <h1 className="title-xl mb-4 delay-1" style={{ color: '#1a1a1a' }}>
            A vida é melhor sobre<br/>
            <span className="font-script" style={{ fontSize: '1.2em' }}>Duas Rodas</span>
          </h1>
          <p className="title-md text-muted mb-8 delay-2" style={{ maxWidth: '700px', margin: '0 auto 2rem auto', fontWeight: 400 }}>
            Descubra pedais desafiadores, conecte-se com a natureza e fortaleça amizades.
            O Tour da Célia é o seu destino para ecopedais e experiências inesquecíveis.
          </p>
          <div className="flex justify-center gap-4 delay-3">
            <a href="#events" className="btn btn-primary" style={{ fontSize: '1rem' }}>
              Ver Próximos Pedais
            </a>
          </div>
        </div>
      </section>

      <section id="events" className="container" style={{ padding: '5rem 1.5rem' }}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="title-lg">Próximos <span className="text-primary">Eventos</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: CyclingEvent, index: number) => (
            <Link 
              to={`/event/${event.id}`} 
              key={event.id} 
              className={`glass-card flex flex-col animate-slide-up delay-${(index % 5) + 1}`} 
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div style={{
                height: '240px',
                backgroundImage: `url(${event.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <span className="badge badge-primary">{event.distance}</span>
                    {event.isSoldOut && <span className="badge badge-secondary" style={{ background: 'var(--color-error)', color: 'white' }}>ESGOTADO</span>}
                  </div>
                  <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
                    <Calendar size={16} />
                    {formatDate(event.date)}
                  </div>
                </div>
                <h3 className="title-md mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-muted mb-6" style={{ fontSize: '0.95rem' }}>
                  <MapPin size={16} className="text-primary" />
                  {event.location}
                </div>
                <div className="mt-auto">
                  <button className="btn btn-secondary w-full">Ver Detalhes</button>
                </div>
              </div>
            </Link>
          ))}
          {events.length === 0 && (
            <div className="text-muted text-center p-8 glass-card" style={{ gridColumn: '1 / -1' }}>
              Nenhum evento futuro encontrado no momento.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { dbService } from '../store/db.ts';
import type { CyclingEvent } from '../store/db.ts';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<CyclingEvent | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (id) {
      dbService.getEventById(id).then(data => {
        setEvent(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div className="container p-8 text-center">Carregando...</div>;

  if (!event) {
    return (
      <div className="container p-8 text-center animate-fade-in">
        <h2 className="title-lg mb-4">Evento não encontrado</h2>
        <Link to="/" className="btn btn-primary">Voltar para a Home</Link>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (event) {
      // 1. Save to Firestore
      await dbService.saveRegistration({
        eventId: event.id,
        participantData: formData,
        registeredAt: new Date().toISOString()
      });

      // 2. Feed Google Form if configured
      if (event.googleFormsUrl) {
        const params = new URLSearchParams();
        
        event.registrationFields.forEach(field => {
          const entryId = (field as any).googleEntryId;
          const value = formData[field.id];
          if (entryId && value) {
            params.append(entryId, value);
          }
        });

        // Redirect to pre-filled Google Form
        const prefilledUrl = `${event.googleFormsUrl}?${params.toString()}`;
        window.open(prefilledUrl, '_blank');
      }

      setIsSubmitted(true);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div style={{
        height: '40vh',
        minHeight: '300px',
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3)), url(${event.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '3rem',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container">
          <Link to="/" className="inline-flex items-center gap-2 text-primary mb-4 hover:underline">
            <ArrowLeft size={20} /> Voltar
          </Link>
          <div className="flex items-center gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
            <span className="badge badge-primary">{event.distance}</span>
            <span className="badge badge-secondary">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
          </div>
          <h1 className="title-xl">{event.title}</h1>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
        {/* Main Content */}
        <div style={{ flex: '1 1 600px' }}>
          <h2 className="title-lg mb-6">Sobre o <span className="text-primary">Percurso</span></h2>
          <p className="text-muted mb-8" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            {event.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card flex items-center gap-4">
              <div style={{ background: 'rgba(250, 204, 21, 0.2)', padding: '1rem', borderRadius: '50%' }}>
                <MapPin size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Localização</p>
                <p className="font-semibold">{event.location}</p>
              </div>
            </div>
            
            <div className="glass-card flex items-center gap-4">
              <div style={{ background: 'var(--color-primary-light)', padding: '1rem', borderRadius: '50%' }}>
                <Calendar size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Data do Evento</p>
                <p className="font-semibold">{new Date(event.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Sponsors Section */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="mt-12">
              <h3 className="title-md mb-6">Nossos <span className="text-primary">Patrocinadores</span></h3>
              <div className="flex flex-wrap gap-8 items-center">
                {event.sponsors.map((sponsor, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '0.75rem 1.5rem', background: '#f9f9fb' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{sponsor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: '1 1 350px', maxWidth: '450px' }}>
          <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
            <h3 className="title-md mb-2">Inscrições Abertas</h3>
            <p className="text-muted mb-6">Garanta sua vaga neste evento exclusivo do Tour da Célia.</p>
            
            <button 
              className="btn btn-primary w-full" 
              style={{ fontSize: '1.2rem', padding: '1rem' }}
              onClick={() => setIsModalOpen(true)}
            >
              Inscreva-se Agora
            </button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', background: '#ffffff', border: '1px solid var(--color-primary-light)' }}>
            {isSubmitted ? (
               <div className="text-center p-6">
                 <CheckCircle2 size={64} className="text-success mb-4 mx-auto" style={{ color: 'var(--color-success)' }} />
                 <h2 className="title-md mb-2">Inscrição Confirmada!</h2>
                 <p className="text-muted mb-6">Te aguardamos ansiosamente no {event.title}.</p>
                 <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Fechar</button>
               </div>
            ) : (
              <>
                <h2 className="title-md mb-4">Formulário de Inscrição</h2>
                <form onSubmit={handleSubmit}>
                  {event.registrationFields.map(field => (
                    <div className="form-group" key={field.id}>
                      <label className="form-label">
                        {field.name} {field.required && <span className="text-error" style={{ color: 'var(--color-error)' }}>*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select 
                          className="form-input" 
                          required={field.required}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input 
                          type={field.type} 
                          className="form-input" 
                          required={field.required}
                          placeholder={`Digite seu ${field.name.toLowerCase()}`}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex justify-end gap-4 mt-8">
                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Confirmar Inscrição</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;

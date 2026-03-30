import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, CheckCircle2, Share2 } from 'lucide-react';
import { dbService } from '../store/db.ts';
import type { CyclingEvent } from '../store/db.ts';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<CyclingEvent | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
  };

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

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const current = formData[fieldId]?.split(',').filter(x => x) || [];
    const updated = checked ? [...current, option] : current.filter(x => x !== option);
    handleInputChange(fieldId, updated.join(','));
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
        const formAction = event.googleFormsUrl.replace('/viewform', '/formResponse'); // Action URL
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = formAction;
        hiddenForm.target = 'silent-google-form';
        hiddenForm.style.display = 'none';

        event.registrationFields.forEach(field => {
          const entryId = (field as any).googleEntryId;
          const value = formData[field.id];
          if (entryId && value) {
            // Google Forms checkboxes can share the same entryId for multiple values
            const values = value.split(',');
            values.forEach(val => {
              const input = document.createElement('input');
              input.name = entryId;
              input.value = val;
              hiddenForm.appendChild(input);
            });
          }
        });

        document.body.appendChild(hiddenForm);
        hiddenForm.submit();
        document.body.removeChild(hiddenForm);
      }

      setIsSubmitted(true);
    }
  };

  return (
    <div className="animate-fade-in">
      <iframe name="silent-google-form" style={{ display: 'none' }}></iframe>

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
            <span className="badge badge-secondary">{formatDate(event.date)}</span>
          </div>
          <h1 className="title-xl">{event.title}</h1>
        </div>
      </div>

      <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 500px' }}>
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="animate-scale-in"
            style={{ width: '100%', borderRadius: 'var(--radius-xl)', marginBottom: '50px', boxShadow: '0 20px 40px rgba(255,0,128,0.1)' }} 
          />
          
          <h2 className="title-md animate-slide-up delay-2" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>Sobre o <span className="text-primary">Percurso</span></h2>
          <p className="text-muted animate-slide-up delay-3" style={{ fontSize: '1.25rem', lineHeight: 2.2, marginBottom: '80px', maxWidth: '800px' }}>
            {event.description}
          </p>

          <div className="flex flex-col gap-14 animate-slide-up delay-4" style={{ marginBottom: '120px' }}>
            <div className="flex items-start gap-8">
              <div style={{ background: 'var(--color-primary-light)', padding: '1.25rem', borderRadius: '50%', flexShrink: 0 }}>
                <MapPin size={32} className="text-primary" />
              </div>
              <div style={{ paddingTop: '0.5rem' }}>
                <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Localização</p>
                <p className="font-semibold" style={{ fontSize: '1.5rem', color: 'var(--color-text)', lineHeight: 1.1 }}>{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-8">
              <div style={{ background: 'var(--color-primary-light)', padding: '1.25rem', borderRadius: '50%', flexShrink: 0 }}>
                <Calendar size={32} className="text-primary" />
              </div>
              <div style={{ paddingTop: '0.5rem' }}>
                <p className="text-muted" style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Data do Evento</p>
                <p className="font-semibold" style={{ fontSize: '1.5rem', color: 'var(--color-text)', lineHeight: 1.1 }}>{formatDate(event.date)}</p>
              </div>
            </div>
          </div>

          {/* Sponsors Section */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="pt-24" style={{ borderTop: '2px solid var(--color-border)', marginTop: '120px' }}>
              <h3 className="title-md" style={{ fontSize: '2rem', marginBottom: '50px' }}>Nossos <span className="text-primary">Patrocinadores</span></h3>
              <div className="flex flex-wrap gap-12 items-center">
                {event.sponsors.map((sponsor, idx) => (
                  <div key={idx} style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '1.25rem' }}>{sponsor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 350px', maxWidth: '450px' }}>
          <div className="glass-card animate-scale-in" style={{ position: 'sticky', top: '100px', border: event.isSoldOut ? '2px solid var(--color-error)' : '2px solid var(--color-primary)' }}>
            <h3 className="title-md mb-2">{event.isSoldOut ? 'Vagas Esgotadas' : 'Inscrições Abertas'}</h3>
            <p className="text-muted mb-6">
              {event.isSoldOut 
                ? 'Este evento já atingiu o limite de participantes. Fique atento aos próximos!' 
                : 'Garanta sua vaga neste evento exclusivo do Tour da Célia.'}
            </p>
            {!event.isSoldOut && (
              <button className="btn btn-primary w-full mb-4" onClick={() => setIsModalOpen(true)}>
                Inscreva-se Agora
              </button>
            )}
            <button 
              className="btn btn-secondary w-full flex items-center justify-center gap-2" 
              style={{ background: '#25D366', color: 'white', border: 'none', opacity: event.isSoldOut ? 0.8 : 1 }}
              onClick={() => {
                const text = `Confira esse pedal incrível: ${event.title}! Veja mais detalhes aqui: ${window.location.href}`;
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
              }}
            >
              <Share2 size={18} /> Compartilhar no WhatsApp
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ borderRadius: 'var(--radius-xl)' }}>
            {isSubmitted ? (
              <div className="text-center p-6">
                <CheckCircle2 size={64} className="text-success mb-4 mx-auto" />
                <h2 className="title-md mb-2">Inscrição Confirmada!</h2>
                <p className="text-muted mb-6">Tudo pronto para o pedal. {event.googleFormsUrl && ' Seus dados também foram enviados para o Google Forms.'}</p>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Fechar</button>
              </div>
            ) : (
              <>
                <h2 className="title-md mb-4">Formulário de Inscrição</h2>
                <form onSubmit={handleSubmit}>
                  {event.registrationFields.map(field => (
                    <div className="form-group mb-6" key={field.id}>
                      <label className="form-label">
                        {field.name} {field.required && <span className="text-error" style={{ color: 'var(--color-error)' }}>*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select className="form-input" required={field.required} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)}>
                          <option value="">Selecione...</option>
                          {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (field.type === 'checkbox' || field.type === 'radio') ? (
                        <div className="grid grid-cols-1 gap-3 mt-3">
                          {field.options?.map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-4 glass-card" style={{
                              cursor: 'pointer',
                              background: formData[field.id]?.split(',').includes(opt) ? 'var(--color-primary-light)' : '#f9f9fb',
                              border: formData[field.id]?.split(',').includes(opt) ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)'
                            }}>
                              <input
                                type={field.type}
                                name={field.id}
                                required={field.required && field.type === 'radio' && !formData[field.id]}
                                checked={formData[field.id]?.split(',').includes(opt) || false}
                                onChange={(e) => {
                                  if (field.type === 'radio') {
                                    handleInputChange(field.id, opt);
                                  } else {
                                    handleCheckboxChange(field.id, opt, e.target.checked);
                                  }
                                }}
                              />
                              <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input type={field.type} className="form-input" required={field.required} placeholder={`Digite seu ${field.name.toLowerCase()}`} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                      )}
                    </div>
                  ))}
                  <div className="flex flex-wrap items-center justify-end gap-6 mt-10">
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>Confirmar Inscrição</button>
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

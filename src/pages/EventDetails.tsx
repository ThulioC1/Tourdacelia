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

      <div className="container" style={{ padding: '4rem 1.5rem', display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 600px' }}>
          <h2 className="title-lg mb-6">Sobre o <span className="text-primary">Percurso</span></h2>
          <p className="text-muted mb-8" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            {event.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="glass-card flex items-center gap-5 p-6" style={{ background: '#f9f9fb' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '1.25rem', borderRadius: '50%' }}>
                <MapPin size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.95rem', fontWeight: 500 }}>Localização</p>
                <p className="font-semibold" style={{ fontSize: '1.1rem' }}>{event.location}</p>
              </div>
            </div>
            
            <div className="glass-card flex items-center gap-5 p-6" style={{ background: '#f9f9fb' }}>
              <div style={{ background: 'var(--color-primary-light)', padding: '1.25rem', borderRadius: '50%' }}>
                <Calendar size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.95rem', fontWeight: 500 }}>Data do Evento</p>
                <p className="font-semibold" style={{ fontSize: '1.1rem' }}>{formatDate(event.date)}</p>
              </div>
            </div>
          </div>

          {/* Sponsors Section */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="mt-16 pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
              <h3 className="title-md mb-8">Nossos <span className="text-primary">Patrocinadores</span></h3>
              <div className="flex flex-wrap gap-6 items-center">
                {event.sponsors.map((sponsor, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '0.85rem 2rem', background: '#f9f9fb', borderRadius: '99px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>{sponsor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 350px', maxWidth: '450px' }}>
          <div className="glass-card" style={{ position: 'sticky', top: '100px' }}>
            <h3 className="title-md mb-2">Inscrições Abertas</h3>
            <p className="text-muted mb-6">Garanta sua vaga neste evento exclusivo do Tour da Célia.</p>
            <button className="btn btn-primary w-full" onClick={() => setIsModalOpen(true)}>
              Inscreva-se Agora
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

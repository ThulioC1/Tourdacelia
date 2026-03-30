import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, LogOut, CheckCircle2, Edit2, Trash2, X, Link as LinkIcon, Shield, MapPin, ExternalLink } from 'lucide-react';
import { dbService } from '../store/db.ts';
import type { CyclingEvent, EventRegistrationField } from '../store/db.ts';
import { auth } from '../firebase.ts';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<CyclingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'team'>('events');
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sponsorsRaw, setSponsorsRaw] = useState(''); // Comma separated
  const [googleFormsUrl, setGoogleFormsUrl] = useState('');
  const [isSoldOut, setIsSoldOut] = useState(false);
  
  const [fields, setFields] = useState<EventRegistrationField[]>([
    { id: 'name', name: 'Nome Completo', type: 'text', required: true },
    { id: 'phone', name: 'Telefone/WhatsApp', type: 'tel', required: true }
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/admin');
      } else {
        loadData();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const data = await dbService.getEvents();
    setEvents(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin');
  };

  const handleAddField = () => {
    setFields([...fields, { id: `field_${Date.now()}`, name: '', type: 'text', required: false }]);
  };

  const updateField = (index: number, key: keyof EventRegistrationField, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const resetForm = () => {
    setTitle(''); setDate(''); setLocation(''); setDistance(''); setDescription(''); setImageUrl(''); 
    setSponsorsRaw(''); setGoogleFormsUrl(''); setIsSoldOut(false); setEditingId(null);
    setFields([
      { id: 'name', name: 'Nome Completo', type: 'text', required: true },
      { id: 'phone', name: 'Telefone/WhatsApp', type: 'tel', required: true }
    ]);
    setIsFormOpen(false);
  };

  const handleEdit = (event: CyclingEvent) => {
    setEditingId(event.id);
    setTitle(event.title);
    setDate(event.date);
    setLocation(event.location);
    setDistance(event.distance);
    setDescription(event.description);
    setImageUrl(event.imageUrl);
    setSponsorsRaw(event.sponsors?.join(', ') || '');
    setGoogleFormsUrl(event.googleFormsUrl || '');
    setIsSoldOut(event.isSoldOut || false);
    setFields(event.registrationFields);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      await dbService.deleteEvent(id);
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Omit<CyclingEvent, 'id'> = {
      title, date, location, distance, description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      status: 'upcoming',
      registrationFields: fields.filter(f => f.name.trim() !== ''),
      sponsors: sponsorsRaw.split(',').map(s => s.trim()).filter(s => s !== ''),
      googleFormsUrl,
      isSoldOut
    };

    if (editingId) {
      await dbService.updateEvent(editingId, eventData);
    } else {
      await dbService.addEvent(eventData);
    }
    
    resetForm();
    loadData();
  };

  if (loading) return <div className="container p-8 text-center">Carregando Painel...</div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <h1 className="title-lg">Painel de Controle</h1>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={() => setActiveTab('events')} 
              className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              <Calendar size={16} /> Eventos
            </button>
            <button 
              onClick={() => setActiveTab('team')} 
              className={`btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            >
              <Shield size={16} /> Equipe
            </button>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary text-error" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
          <LogOut size={18} /> Sair
        </button>
      </div>

      {activeTab === 'events' ? (
        <>
          {!isFormOpen ? (
            <div className="glass-card mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="title-md flex items-center gap-2"><Calendar className="text-primary" /> Gerenciar Pedais</h2>
                <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                  <Plus size={18} /> Novo Evento
                </button>
              </div>
              
              <div className="grid gap-4">
                {events.map(event => (
                  <div key={event.id} className="glass-card flex justify-between items-center" style={{ background: '#f9f9fb' }}>
                    <div>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <div className="flex gap-4 text-muted mt-2 text-sm">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => navigate(`/event/${event.id}`)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Visualizar Site">
                         <ExternalLink size={18} className="text-muted" />
                       </button>
                       <button onClick={() => handleEdit(event)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Editar">
                         <Edit2 size={18} className="text-primary" />
                       </button>
                       <button onClick={() => handleDelete(event.id)} className="btn btn-secondary" style={{ padding: '0.5rem' }} title="Excluir">
                         <Trash2 size={18} className="text-error" style={{ color: 'var(--color-error)' }} />
                       </button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-center text-muted p-8">Nenhum evento cadastrado.</p>}
              </div>
            </div>
          ) : (
            <div className="glass-card animate-fade-in mb-8" style={{ borderTop: '4px solid var(--color-primary)' }}>
              <div className="flex justify-between items-center mb-12">
                <h2 className="title-md" style={{ fontSize: '1.75rem' }}>{editingId ? 'Editar Evento' : 'Criar Novo Evento'}</h2>
                <button className="btn btn-secondary p-3" style={{ borderRadius: '50%' }} onClick={resetForm}><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div className="flex flex-col gap-12">
                  <div className="form-group">
                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Título do Evento</p>
                    <input required type="text" className="form-input" style={{ padding: '1rem' }} value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="form-group">
                      <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Data</p>
                      <input required type="date" className="form-input" style={{ padding: '1rem' }} value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Localização</p>
                      <input required type="text" className="form-input" style={{ padding: '1rem' }} value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Distância (KM)</p>
                    <input required type="text" className="form-input" style={{ padding: '1rem' }} value={distance} onChange={e => setDistance(e.target.value)} />
                  </div>
                  
                  <div className="form-group">
                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Patrocinadores (separados por vírgula)</p>
                    <input type="text" className="form-input" style={{ padding: '1rem' }} value={sponsorsRaw} onChange={e => setSponsorsRaw(e.target.value)} placeholder="Ex: Nike, Specialized, Shimano" />
                  </div>
                  
                  <div className="form-group">
                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Google Forms URL (Opcional)</p>
                    <div style={{ position: 'relative' }}>
                      <input type="url" className="form-input" style={{ padding: '1rem 1rem 1rem 3rem' }} value={googleFormsUrl} onChange={e => setGoogleFormsUrl(e.target.value)} placeholder="https://docs.google.com/forms/..." />
                      <LinkIcon size={20} className="text-primary" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>URL da Imagem</p>
                    <input type="text" className="form-input" style={{ padding: '1rem' }} value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                  </div>
                  
                  <div className="form-group">
                    <p className="text-muted mb-3" style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Descrição</p>
                    <textarea required className="form-input" rows={6} style={{ padding: '1rem' }} value={description} onChange={e => setDescription(e.target.value)}></textarea>
                  </div>

                  <div className="form-group" style={{ marginTop: '2rem' }}>
                    <div className="flex items-center gap-6 p-6 bg-white border-2 border-dashed rounded-2xl hover:border-primary transition-all" style={{ borderColor: isSoldOut ? 'var(--color-error)' : 'var(--color-border)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={isSoldOut} onChange={e => setIsSoldOut(e.target.checked)} style={{ width: '28px', height: '28px', accentColor: 'var(--color-primary)' }} />
                      </label>
                      <div onClick={() => setIsSoldOut(!isSoldOut)} style={{ cursor: 'pointer' }}>
                        <p className="font-bold mb-1" style={{ color: isSoldOut ? 'var(--color-error)' : 'var(--color-text)', fontSize: '1.1rem' }}>
                          {isSoldOut ? 'VAGAS ESGOTADAS' : 'Vagas Disponíveis'}
                        </p>
                        <p className="text-sm text-muted">Ative para bloquear inscrições no site</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-12">
                   <div className="flex justify-between items-center mb-4">
                    <h3 className="title-md" style={{ fontSize: '1.4rem' }}>Formulário de Inscrição</h3>
                    <button type="button" onClick={handleAddField} className="btn btn-primary text-sm" style={{ padding: '0.5rem 1.2rem' }}>+ Adicionar Campo</button>
                  </div>
                  
                  <div className="flex flex-col gap-12">
                    {fields.map((field, idx) => (
                      <div key={idx} className="flex flex-col gap-6 pb-12" style={{ borderBottom: idx !== fields.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                        <div className="flex flex-wrap gap-6 items-end">
                          <div style={{ flex: '1 1 250px' }}>
                            <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Nome do Campo</p>
                            <input type="text" className="form-input" style={{ padding: '0.8rem' }} placeholder="Ex: Nome Completo" value={field.name} onChange={e => updateField(idx, 'name', e.target.value)} />
                          </div>
                          <div style={{ width: '180px' }}>
                            <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo de Resposta</p>
                            <select className="form-input" style={{ padding: '0.8rem' }} value={field.type} onChange={e => updateField(idx, 'type', e.target.value as any)}>
                              <option value="text">Texto Simples</option>
                              <option value="tel">Telefone/WhatsApp</option>
                              <option value="email">E-mail</option>
                              <option value="checkbox">Várias Escolhas</option>
                              <option value="radio">Escolha Única</option>
                              <option value="select">Lista Suspensa</option>
                            </select>
                          </div>
                          <button type="button" onClick={() => {
                            const updated = fields.filter((_, i) => i !== idx);
                            setFields(updated);
                          }} className="text-error p-3 hover:bg-red-50 rounded-full transition-colors mb-1"><Trash2 size={22} /></button>
                        </div>

                        {(field.type === 'select' || field.type === 'checkbox' || field.type === 'radio') && (
                          <div className="form-group">
                             <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Opções (separadas por vírgula)</p>
                             <input 
                               type="text" 
                               className="form-input" 
                               style={{ padding: '0.8rem' }}
                               placeholder="Opção 1, Opção 2, Opção 3..." 
                               value={field.options?.join(', ') || ''} 
                               onChange={e => updateField(idx, 'options', e.target.value.split(',').map(o => o.trim()))} 
                             />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-8 items-center justify-between">
                          <div style={{ flex: '1 1 250px' }}>
                            <p className="text-muted mb-2" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>ID Google Form (entry.xxxxxxx)</p>
                            <input type="text" className="form-input text-sm" style={{ padding: '0.8rem' }} placeholder="Ex: entry.123456789" value={(field as any).googleEntryId || ''} onChange={e => updateField(idx, 'googleEntryId' as any, e.target.value)} />
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input type="checkbox" checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} style={{ width: '22px', height: '22px', accentColor: 'var(--color-primary)' }} />
                            <span className="font-bold" style={{ fontSize: '0.9rem' }}>Campo Obrigatório</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-16 pt-8" style={{ borderTop: '2px solid var(--color-border)' }}>
                    <button type="submit" className="btn btn-primary w-full" style={{ padding: '1.5rem', fontSize: '1.2rem', borderRadius: 'var(--radius-lg)' }}>
                      <CheckCircle2 size={28} /> {editingId ? 'Salvar Alterações do Pedal' : 'Publicar Novo Pedal'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card animate-fade-in">
          <h2 className="title-md mb-4">Gestão de Equipe</h2>
          <p className="text-muted mb-8">Gerencie quem pode postar ou administrar o portal Tour da Célia.</p>
          
          <div className="grid gap-4 max-w-2xl">
            <div className="glass-card flex justify-between items-center" style={{ background: '#f9f9fb' }}>
               <div>
                 <p className="font-bold">Em breve: Convites por E-mail</p>
                 <p className="text-muted text-sm">Você poderá adicionar novos administradores e postadores aqui.</p>
               </div>
               <button className="btn btn-secondary" disabled>Convidar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

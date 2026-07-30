import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, Save, Edit2, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const img = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

const labelStyle = {
  fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 500,
  letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-muted)',
  display: 'block', marginBottom: 6,
};
const inputStyle = {
  width: '100%', padding: '11px 0', border: 'none', borderBottom: '1px solid var(--card-border)',
  background: 'transparent', outline: 'none', fontFamily: 'Inter, sans-serif',
  fontSize: '0.9rem', fontWeight: 300, color: 'var(--text)',
  boxSizing: 'border-box',
};
const textareaStyle = {
  ...inputStyle,
  borderBottom: 'none',
  border: '1px solid var(--card-border)',
  padding: '11px 14px',
  resize: 'vertical',
  minHeight: 100,
  lineHeight: 1.7,
};

export default function MyDesignerProfilePage() {
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const portfolioImgRef = useRef(null);

  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  const [form, setForm] = useState({
    name: '', bio: '', experience: '', phone: '', instagram: '', website: '',
    specialtiesStr: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [newItem, setNewItem] = useState({ title: '', description: '', year: '' });
  const [newItemFiles, setNewItemFiles] = useState([]);
  const [newItemPreviews, setNewItemPreviews] = useState([]);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', year: '' });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [savingItem, setSavingItem] = useState(false);
  const editImgRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login?message=auth-required'); return; }
    if (user.role !== 'DESIGNER' && user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    api.get('/api/designers/me/profile')
      .then(r => {
        setProfile(r.data);
        const p = r.data;
        setForm({
          name: p.user?.name || user.name || '',
          bio: p.bio || '',
          experience: p.experience || '',
          phone: p.phone || '',
          instagram: p.instagram || '',
          website: p.website || '',
          specialtiesStr: Array.isArray(p.specialties) ? p.specialties.join(', ') : '',
        });
      })
      .catch(() => toast.error('Eroare la încărcarea profilului.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Numele profilului este obligatoriu.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('bio', form.bio);
      fd.append('experience', form.experience);
      fd.append('phone', form.phone);
      fd.append('instagram', form.instagram);
      fd.append('website', form.website);
      const specialties = form.specialtiesStr.split(',').map(s => s.trim()).filter(Boolean);
      fd.append('specialties', JSON.stringify(specialties));
      if (avatarFile) fd.append('avatar', avatarFile);

      const res = await api.put('/api/designers/me/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(res.data);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, name: res.data.user?.name || form.name.trim() }));
      setAvatarFile(null);
      toast.success('Profil actualizat!');
    } catch {
      toast.error('Eroare la salvare.');
    }
    setSaving(false);
  };

  const handleNewItemFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setNewItemFiles(files);
    setNewItemPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const refreshProfile = async () => {
    const r = await api.get('/api/designers/me/profile');
    setProfile(r.data);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) { toast.error('Titlul este obligatoriu.'); return; }
    setAddingItem(true);
    try {
      const fd = new FormData();
      fd.append('title', newItem.title);
      fd.append('description', newItem.description);
      fd.append('year', newItem.year);
      newItemFiles.forEach(f => fd.append('images', f));

      await api.post('/api/designers/me/portfolio', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshProfile();
      setNewItem({ title: '', description: '', year: '' });
      setNewItemFiles([]);
      setNewItemPreviews([]);
      toast.success('Proiect adăugat!');
    } catch {
      toast.error('Eroare la adăugare.');
    }
    setAddingItem(false);
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditForm({ title: item.title, description: item.description || '', year: item.year || '' });
    setEditFile(null);
    setEditPreview(null);
  };

  const handleSaveEdit = async (itemId) => {
    if (!editForm.title.trim()) { toast.error('Titlul este obligatoriu.'); return; }
    setSavingItem(true);
    try {
      const fd = new FormData();
      fd.append('title', editForm.title);
      fd.append('description', editForm.description);
      fd.append('year', editForm.year);
      if (editFile) fd.append('image', editFile);
      await api.put(`/api/designers/me/portfolio/${itemId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshProfile();
      setEditingItemId(null);
      toast.success('Proiect actualizat!');
    } catch {
      toast.error('Eroare la salvare.');
    }
    setSavingItem(false);
  };

  const handleAddGalleryImages = (itemId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;
      try {
        const fd = new FormData();
        files.forEach(f => fd.append('images', f));
        await api.post(`/api/designers/me/portfolio/${itemId}/images`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await refreshProfile();
        toast.success('Fotografii adăugate!');
      } catch {
        toast.error('Eroare la încărcarea fotografiilor.');
      }
    };
    input.click();
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Ștergi acest proiect din portofoliu?')) return;
    try {
      await api.delete(`/api/designers/me/portfolio/${itemId}`);
      await refreshProfile();
      if (editingItemId === itemId) setEditingItemId(null);
      toast.success('Proiect șters.');
    } catch {
      toast.error('Eroare la ștergere.');
    }
  };

  if (loading) return (
    <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>
  );

  const currentAvatar = avatarPreview || (profile?.avatarUrl && img(profile.avatarUrl));

  return (
    <div className="museum-home">
      <Navbar />

      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)' }}>
        <span className="museum-kicker">Dashboard designer</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 8 }}>
          Profilul meu
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Informațiile tale sunt vizibile public la{' '}
          <Link to={`/designers/${profile?.id}`} style={{ color: 'var(--text)', borderBottom: '1px solid var(--card-border)' }}>
            /designers/{profile?.id}
          </Link>
        </p>
      </div>

      <main style={{ padding: '52px 48px 100px', maxWidth: 780, margin: '0 auto' }}>

        {/* Profile form */}
        <section style={{ marginBottom: 60 }}>
          <p style={labelStyle}>Informații personale</p>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Avatar upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 72, height: 72, flexShrink: 0, border: '1px solid var(--card-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream-dark)' }}>
                {currentAvatar
                  ? <img src={currentAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: 'var(--text-muted)' }}>
                      {user.name?.[0]?.toUpperCase() || 'D'}
                    </span>
                }
              </div>
              <div>
                <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                <button type="button" onClick={() => avatarRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid var(--card-border)', padding: '8px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 400 }}>
                  <Upload size={12} strokeWidth={1.5} />
                  Schimbă poza de profil
                </button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nume profil</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Numele afisat public pe profil"
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder="Câteva cuvinte despre tine și abordarea ta de design..."
                style={textareaStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Experiență</label>
              <textarea
                value={form.experience}
                onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                placeholder="Studii, ani de experiență, proiecte notabile..."
                style={{ ...textareaStyle, minHeight: 80 }}
              />
            </div>

            <div>
              <label style={labelStyle}>Specialități (separate prin virgulă)</label>
              <input
                value={form.specialtiesStr}
                onChange={e => setForm(p => ({ ...p, specialtiesStr: e.target.value }))}
                placeholder="Minimalism, Scandinav, Rezidenţial, Comercial..."
                style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={labelStyle}>Telefon</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+40 7xx xxx xxx" style={inputStyle}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'} />
              </div>
              <div>
                <label style={labelStyle}>Instagram</label>
                <input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                  placeholder="@username sau URL" style={inputStyle}
                  onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                  onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Website</label>
              <input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                placeholder="www.site-ul-tau.ro" style={inputStyle}
                onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'} />
            </div>

            <button type="submit" disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: saving ? 0.6 : 1 }}>
              <Save size={13} strokeWidth={1.5} />
              {saving ? 'Se salvează…' : 'Salvează profilul'}
            </button>
          </form>
        </section>

        {/* Portfolio */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
            <p style={labelStyle}>Portofoliu</p>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 300 }}>
              {profile?.portfolioItems?.length || 0} proiecte
            </span>
          </div>

          {/* Add item form */}
          <div style={{ border: '1px solid var(--card-border)', padding: '24px', marginBottom: 28, background: 'var(--cream-dark)' }}>
            <p style={{ ...labelStyle, marginBottom: 18 }}>Adaugă proiect nou</p>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Titlu proiect *</label>
                  <input value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))}
                    placeholder="Apartament minimalist, Centru" style={inputStyle}
                    onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                    onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'} required />
                </div>
                <div style={{ width: 90 }}>
                  <label style={labelStyle}>Anul</label>
                  <input type="number" value={newItem.year} onChange={e => setNewItem(p => ({ ...p, year: e.target.value }))}
                    placeholder="2024" style={{ ...inputStyle, textAlign: 'center' }}
                    onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                    onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Descriere</label>
                <textarea value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                  placeholder="Scurtă descriere a proiectului..." style={{ ...textareaStyle, minHeight: 70 }} />
              </div>

              {/* Image upload — multiple */}
              <div>
                <input ref={portfolioImgRef} type="file" accept="image/*" multiple onChange={handleNewItemFilesChange} style={{ display: 'none' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button type="button" onClick={() => portfolioImgRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: '1px solid var(--card-border)', padding: '9px 14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'var(--text)', fontWeight: 400, alignSelf: 'flex-start' }}>
                    <Upload size={12} strokeWidth={1.5} />
                    {newItemFiles.length > 0 ? `${newItemFiles.length} ${newItemFiles.length === 1 ? 'imagine selectată' : 'imagini selectate'} — schimbă` : 'Adaugă imagini (mai multe simultan)'}
                  </button>
                  {newItemPreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {newItemPreviews.map((src, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={src} alt={`preview-${i}`} style={{ height: 56, width: 80, objectFit: 'cover', border: '1px solid var(--card-border)', display: 'block' }} />
                          {i === 0 && (
                            <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.6rem', textAlign: 'center', padding: '2px 0', fontFamily: 'Inter, sans-serif' }}>
                              copertă
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={addingItem}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 20px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: addingItem ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', alignSelf: 'flex-start', opacity: addingItem ? 0.6 : 1 }}>
                <Plus size={13} strokeWidth={1.5} />
                {addingItem ? 'Se adaugă…' : 'Adaugă proiect'}
              </button>
            </form>
          </div>

          {/* Edit cover image ref */}
          <input ref={editImgRef} type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setEditFile(f); setEditPreview(URL.createObjectURL(f)); } }} style={{ display: 'none' }} />

          {/* Portfolio items */}
          {!profile?.portfolioItems?.length ? (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 300 }}>
              Nu ai adăugat încă niciun proiect.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {profile.portfolioItems.map(item => (
                <div key={item.id} style={{ border: '1px solid var(--card-border)', background: 'var(--card)', overflow: 'hidden' }}>

                  {/* Cover image */}
                  <div style={{ height: 160, background: 'var(--cream-dark)', overflow: 'hidden', position: 'relative' }}>
                    {item.imageUrl && img(item.imageUrl)
                      ? <img src={img(item.imageUrl)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      : (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px dashed var(--card-border)' }}
                        >
                          <Upload size={20} strokeWidth={1} color="var(--card-border)" />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 300 }}>Adaugă imagine</span>
                        </button>
                      )
                    }
                  </div>

                  {/* Gallery grid */}
                  {Array.isArray(item.gallery) && item.gallery.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: '2px', background: 'var(--cream-dark)' }}>
                      {item.gallery.map((url, i) => (
                        <div key={i} style={{ aspectRatio: '1 / 1', overflow: 'hidden', background: 'var(--cream-dark)' }}>
                          <img src={img(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Edit form (inline) */}
                  {editingItemId === item.id ? (
                    <div style={{ padding: '14px', background: 'var(--cream-dark)', borderTop: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="Titlu *" style={{ ...inputStyle, fontSize: '0.85rem' }}
                        onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                        onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'} />
                      <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Descriere" style={{ ...textareaStyle, minHeight: 56, fontSize: '0.85rem' }} />
                      <input type="number" value={editForm.year} onChange={e => setEditForm(p => ({ ...p, year: e.target.value }))}
                        placeholder="Anul" style={{ ...inputStyle, fontSize: '0.85rem' }}
                        onFocus={e => e.target.style.borderBottomColor = 'var(--text)'}
                        onBlur={e => e.target.style.borderBottomColor = 'var(--card-border)'} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" onClick={() => editImgRef.current?.click()}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--card-border)', padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'Inter, sans-serif', color: 'var(--text)' }}>
                          <Upload size={11} strokeWidth={1.5} />
                          Schimbă imaginea
                        </button>
                        {editPreview && <img src={editPreview} alt="preview" style={{ height: 32, width: 48, objectFit: 'cover', border: '1px solid var(--card-border)' }} />}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleSaveEdit(item.id)} disabled={savingItem}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: savingItem ? 'not-allowed' : 'pointer', fontSize: '0.72rem', fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: savingItem ? 0.6 : 1 }}>
                          <Check size={11} strokeWidth={2} />
                          {savingItem ? 'Se salvează…' : 'Salvează'}
                        </button>
                        <button onClick={() => setEditingItemId(null)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'none', border: '1px solid var(--card-border)', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'Inter, sans-serif', color: 'var(--text-muted)' }}>
                          <X size={11} strokeWidth={1.5} />
                          Anulează
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '12px 14px 14px' }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', marginBottom: 2 }}>{item.title}</p>
                      {item.year && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 300, marginBottom: 10 }}>{item.year}</p>}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button onClick={() => handleStartEdit(item)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                          <Edit2 size={12} strokeWidth={1.5} />
                          Editează
                        </button>
                        <button onClick={() => handleAddGalleryImages(item.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                          <Plus size={12} strokeWidth={1.5} />
                          Adaugă poze
                        </button>
                        <button onClick={() => handleDeleteItem(item.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', padding: 0, fontFamily: 'Inter, sans-serif' }}>
                          <Trash2 size={12} strokeWidth={1.5} />
                          Șterge
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

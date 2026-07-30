import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const SECTIONS = [
  { key: 'style',       label: 'Stiluri',       icon: '🖼️' },
  { key: 'interior',    label: 'Interioare',     icon: '🛋️' },
  { key: 'object',      label: 'Obiecte',        icon: '🪑' },
  { key: 'category',    label: 'Categorii',      icon: '📁' },
  { key: 'moviehouse',  label: 'Movie Houses',   icon: '🎬' },
  { key: 'room',        label: 'Camere',         icon: '🏠' },
  { key: 'story',       label: 'Articole',       icon: '📖' },
];

const inputStyle = { padding: '10px 14px', border: '1.5px solid var(--card-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem', background: 'var(--cream)', outline: 'none', width: '100%' };
const API_IMG = (url) => (!url ? null : url.startsWith('http') ? url : `http://localhost:5000${url}`);

const F = ({ label, name, value, onChange, type = 'text', as, placeholder, multiple }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)' }}>{label}</label>
    {as === 'textarea'
      ? <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={3} style={inputStyle} />
      : type === 'file'
        ? <input type="file" name={name} onChange={onChange} accept="image/*" multiple={multiple} style={{ fontSize: '0.88rem' }} />
        : <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
    }
  </div>
);

const FormWrap = ({ title, onSubmit, children, submitting }) => (
  <form onSubmit={onSubmit} style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', maxWidth: 640 }}>
    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', marginBottom: 22 }}>{title}</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start', marginTop: 6 }}>
        {submitting ? 'Se salvează…' : 'Salvează →'}
      </button>
    </div>
  </form>
);

export default function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const [section,    setSection]    = useState('style');
  const [categories, setCategories] = useState([]);
  const [styles,     setStyles]     = useState([]);
  const [houses,     setHouses]     = useState([]);
  const [interiors,  setInteriors]  = useState([]);
  const [rooms,      setRooms]      = useState([]);
  const [stories,    setStories]    = useState([]);
  const [allObjects, setAllObjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Style form
  const emptyStyleForm = { title: '', slug: '', kicker: '', description: '', history: '', period: '', audience: '', colors: '', materials: '', categoryId: '', image: null };
  const [styleForm,    setStyleForm]    = useState(emptyStyleForm);
  const [editingStyle, setEditingStyle] = useState(null);

  // Style gallery
  const [sgStyleId,    setSgStyleId]    = useState('');
  const [sgFiles,      setSgFiles]      = useState([]);
  const [sgCaption,    setSgCaption]    = useState('');
  const [sgPhotos,     setSgPhotos]     = useState([]);
  const [sgObjPhotoId, setSgObjPhotoId] = useState(null);
  const [sgObjForm,    setSgObjForm]    = useState({ name: '', description: '', shopLink: '', price: '' });

  // Style gallery inline (per-row in styles list)
  const [styleGalleryPanel, setStyleGalleryPanel] = useState(null);
  const [styleGalleryFiles, setStyleGalleryFiles] = useState({});

  // Interior gallery objects
  const [igObjPhotoId, setIgObjPhotoId] = useState(null);
  const [igObjForm,    setIgObjForm]    = useState({ name: '', description: '', shopLink: '', price: '' });

  // Interior form
  const emptyIntForm = { title: '', slug: '', subtitle: '', description: '', styleId: '', roomType: '', image: null };
  const [intForm,         setIntForm]         = useState(emptyIntForm);
  const [editingInterior, setEditingInterior] = useState(null);
  const [intGalleryFiles, setIntGalleryFiles] = useState({});
  const [intGalleryPanel, setIntGalleryPanel] = useState(null);

  // Object form
  const [objForm, setObjForm] = useState({ interiorId: '', name: '', description: '', shopLink: '', price: '', store: '', image: null });

  // Movie house form
  const emptyMhForm = { title: '', slug: '', kicker: '', description: '', history: '', image: null };
  const [mhForm,       setMhForm]       = useState(emptyMhForm);
  const [editingHouse, setEditingHouse] = useState(null);
  const [mhGallery,    setMhGallery]    = useState({ houseId: '', files: [] });

  // Movie location form
  const emptyLocForm = { title: '', kicker: '', description: '', history: '', image: null };
  const [locPanelHouseId, setLocPanelHouseId] = useState(null);
  const [newLocForm,      setNewLocForm]      = useState(emptyLocForm);
  const [editingLocId,    setEditingLocId]    = useState(null);
  const [editLocForm,     setEditLocForm]     = useState(emptyLocForm);
  const [locGalleryFiles, setLocGalleryFiles] = useState({});

  // Room form
  const emptyRoomForm = { title: '', description: '', order: '', image: null };
  const [roomForm,     setRoomForm]     = useState(emptyRoomForm);
  const [editingRoom,  setEditingRoom]  = useState(null);

  // Story form
  const emptyStoryForm = { title: '', kicker: '', excerpt: '', content: '', author: '', sourceUrl: '', readTime: '', image: null };
  const [storyForm,     setStoryForm]     = useState(emptyStoryForm);
  const [editingStory,  setEditingStory]  = useState(null);

  // Category form
  const [catForm,       setCatForm]       = useState({ name: '', slug: '', description: '' });
  const [editingCat,    setEditingCat]    = useState(null);

  // Object form
  const emptyObjEditForm = { name: '', description: '', shopLink: '', price: '' };
  const [editingObject,  setEditingObject]  = useState(null);
  const [objEditForm,    setObjEditForm]    = useState(emptyObjEditForm);

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') { navigate('/'); return; }
    api.get('/api/categories').then(r => setCategories(r.data)).catch(() => {});
    api.get('/api/styles').then(r => setStyles(r.data)).catch(() => {});
    api.get('/api/movie-houses').then(r => setHouses(r.data)).catch(() => {});
    api.get('/api/rooms').then(r => setRooms(r.data)).catch(() => {});
    api.get('/api/stories').then(r => setStories(r.data)).catch(() => {});
    api.get('/api/interiors').then(r => setInteriors(r.data)).catch(() => {});
  }, []);

  const field = (setter) => (e) => {
    const { name, value, files } = e.target;
    setter(p => ({ ...p, [name]: files ? files[0] : value }));
  };

  const submit = async (fn) => {
    setSubmitting(true);
    try { await fn(); toast.success('Salvat cu succes!'); }
    catch (err) { toast.error(err?.response?.data?.error || err?.response?.data?.message || 'Eroare la salvare.'); }
    setSubmitting(false);
  };

  // ─── Categories ───
  const createCategory = (e) => {
    e.preventDefault();
    submit(async () => {
      if (editingCat) {
        await api.put(`/api/categories/${editingCat.id}`, catForm);
        setEditingCat(null);
      } else {
        await api.post('/api/categories', catForm);
      }
      setCatForm({ name: '', slug: '', description: '' });
      const r = await api.get('/api/categories'); setCategories(r.data);
    });
  };

  const startEditCat = (cat) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name || '', slug: cat.slug || '', description: cat.description || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditCat = () => { setEditingCat(null); setCatForm({ name: '', slug: '', description: '' }); };

  const deleteCategory = async (id) => {
    if (!window.confirm('Ștergi categoria? Stilurile asociate vor rămâne fără categorie.')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      setCategories(p => p.filter(c => c.id !== id));
      toast.success('Categorie ștearsă.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  // ─── Styles ───
  const startEditStyle = (s) => {
    setEditingStyle(s);
    setStyleForm({
      title: s.title || '', slug: s.slug || '', kicker: s.kicker || '',
      description: s.description || '', history: s.history || '',
      period: s.period || '', audience: s.audience || '',
      colors: Array.isArray(s.colors) ? s.colors.join(', ') : '',
      materials: Array.isArray(s.materials) ? s.materials.join(', ') : '',
      categoryId: s.categoryId ? String(s.categoryId) : '',
      image: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditStyle = () => { setEditingStyle(null); setStyleForm(emptyStyleForm); };

  const saveStyle = (e) => {
    e.preventDefault();
    submit(async () => {
      const data = new FormData();
      ['title','slug','kicker','description','history','period','audience','categoryId'].forEach(k => data.append(k, styleForm[k]));
      data.append('colors', JSON.stringify(styleForm.colors.split(',').map(x => x.trim()).filter(Boolean)));
      data.append('materials', JSON.stringify(styleForm.materials.split(',').map(x => x.trim()).filter(Boolean)));
      if (styleForm.image) data.append('image', styleForm.image);
      if (editingStyle) {
        await api.put(`/api/styles/${editingStyle.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setEditingStyle(null);
      } else {
        await api.post('/api/styles', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setStyleForm(emptyStyleForm);
      const r = await api.get('/api/styles'); setStyles(r.data);
    });
  };

  // ─── Style gallery ───
  const loadStylePhotos = (styleId) => {
    if (!styleId) { setSgPhotos([]); return; }
    const style = styles.find(s => String(s.id) === String(styleId));
    setSgPhotos(style?.galleryPhotos || []);
  };

  const addStyleGalleryImage = (e) => {
    e.preventDefault();
    if (!sgStyleId || !sgFiles.length) { toast.error('Selectează un stil și cel puțin o imagine.'); return; }
    submit(async () => {
      for (const file of sgFiles) {
        const data = new FormData();
        data.append('image', file);
        if (sgCaption) data.append('caption', sgCaption);
        await api.post(`/api/styles/${sgStyleId}/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSgFiles([]); setSgCaption('');
      const r = await api.get('/api/styles'); setStyles(r.data);
      setSgPhotos(r.data.find(s => String(s.id) === String(sgStyleId))?.galleryPhotos || []);
    });
  };

  const deleteGalleryPhoto = async (photoId) => {
    if (!window.confirm('Ștergi această fotografie din galerie?')) return;
    try {
      await api.delete(`/api/styles/${sgStyleId}/gallery/${photoId}`);
      setSgPhotos(p => p.filter(ph => ph.id !== photoId));
      if (sgObjPhotoId === photoId) setSgObjPhotoId(null);
      toast.success('Fotografie ștearsă.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  const addGalleryPhotoObject = (e, photoId) => {
    e.preventDefault();
    if (!sgObjForm.name.trim()) { toast.error('Numele obiectului este obligatoriu.'); return; }
    submit(async () => {
      const data = new FormData();
      ['name','description','shopLink','price'].forEach(k => data.append(k, sgObjForm[k]));
      const res = await api.post(`/api/styles/${sgStyleId}/gallery/${photoId}/objects`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSgPhotos(prev => prev.map(ph => ph.id === photoId ? { ...ph, objects: [...(ph.objects || []), res.data] } : ph));
      setSgObjForm({ name: '', description: '', shopLink: '', price: '' });
      setSgObjPhotoId(null);
    });
  };

  const deleteGalleryPhotoObject = async (photoId, objectId) => {
    try {
      await api.delete(`/api/styles/${sgStyleId}/gallery/${photoId}/objects/${objectId}`);
      setSgPhotos(prev => prev.map(ph => ph.id === photoId ? { ...ph, objects: ph.objects.filter(o => o.id !== objectId) } : ph));
      toast.success('Obiect șters.');
    } catch { toast.error('Eroare.'); }
  };

  const deleteStyleGalleryPhotoInline = async (styleId, photoId) => {
    if (!window.confirm('Ștergi această fotografie?')) return;
    try {
      await api.delete(`/api/styles/${styleId}/gallery/${photoId}`);
      setStyles(p => p.map(s => s.id === styleId ? { ...s, galleryPhotos: (s.galleryPhotos || []).filter(ph => ph.id !== photoId) } : s));
      if (String(sgStyleId) === String(styleId)) setSgPhotos(p => p.filter(ph => ph.id !== photoId));
      toast.success('Fotografie ștearsă.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  const addStyleGalleryInline = (styleId) => async (e) => {
    e.preventDefault();
    const files = styleGalleryFiles[styleId];
    if (!files?.length) { toast.error('Selectează cel puțin o imagine.'); return; }
    setSubmitting(true);
    try {
      for (const file of files) {
        const data = new FormData();
        data.append('image', file);
        await api.post(`/api/styles/${styleId}/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setStyleGalleryFiles(p => ({ ...p, [styleId]: [] }));
      const r = await api.get('/api/styles'); setStyles(r.data);
      toast.success('Poze adăugate!');
    } catch { toast.error('Eroare.'); }
    setSubmitting(false);
  };

  // ─── Interiors ───
  const startEditInterior = (interior) => {
    setEditingInterior(interior);
    setIntForm({
      title: interior.title || '',
      slug: interior.slug || '',
      subtitle: interior.subtitle || '',
      description: interior.description || '',
      styleId: interior.style?.id ? String(interior.style.id) : (interior.styleId ? String(interior.styleId) : ''),
      roomType: interior.roomType || '',
      image: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditInterior = () => { setEditingInterior(null); setIntForm(emptyIntForm); };

  const saveInterior = (e) => {
    e.preventDefault();
    submit(async () => {
      const data = new FormData();
      ['title','slug','subtitle','description','styleId','roomType'].forEach(k => data.append(k, intForm[k]));
      if (intForm.image) data.append('image', intForm.image);
      if (editingInterior) {
        await api.put(`/api/interiors/${editingInterior.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setEditingInterior(null);
      } else {
        await api.post('/api/interiors', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIntForm(emptyIntForm);
      const r = await api.get('/api/interiors'); setInteriors(r.data);
      const r2 = await api.get('/api/styles'); setStyles(r2.data);
    });
  };

  const deleteInterior = async (id) => {
    if (!window.confirm('Ștergi interiorul? Obiectele asociate vor fi șterse și ele.')) return;
    try {
      await api.delete(`/api/interiors/${id}`);
      setInteriors(p => p.filter(i => i.id !== id));
      toast.success('Interior șters.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  const addIntGallery = (interiorId) => async (e) => {
    e.preventDefault();
    const files = intGalleryFiles[interiorId];
    if (!files?.length) { toast.error('Selectează cel puțin o imagine.'); return; }
    setSubmitting(true);
    try {
      for (const file of files) {
        const data = new FormData();
        data.append('image', file);
        await api.post(`/api/interiors/${interiorId}/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIntGalleryFiles(p => ({ ...p, [interiorId]: [] }));
      const r = await api.get('/api/interiors'); setInteriors(r.data);
      toast.success('Poze adăugate!');
    } catch { toast.error('Eroare la upload.'); }
    setSubmitting(false);
  };

  const deleteIntGalleryPhoto = async (interiorId, photoId) => {
    if (!window.confirm('Ștergi poza din galerie?')) return;
    try {
      await api.delete(`/api/interiors/${interiorId}/gallery/${photoId}`);
      setInteriors(p => p.map(i => i.id === interiorId
        ? { ...i, galleryPhotos: (i.galleryPhotos || []).filter(ph => ph.id !== photoId) }
        : i
      ));
      toast.success('Poză ștearsă.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  const addIntGalleryObject = (interiorId, photoId) => async (e) => {
    e.preventDefault();
    if (!igObjForm.name.trim()) { toast.error('Numele obiectului este obligatoriu.'); return; }
    setSubmitting(true);
    try {
      const data = new FormData();
      ['name','description','shopLink','price'].forEach(k => { if (igObjForm[k]) data.append(k, igObjForm[k]); });
      const res = await api.post(`/api/interiors/${interiorId}/gallery/${photoId}/objects`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setInteriors(p => p.map(i => i.id === interiorId
        ? { ...i, galleryPhotos: (i.galleryPhotos || []).map(ph => ph.id === photoId ? { ...ph, objects: [...(ph.objects || []), res.data] } : ph) }
        : i
      ));
      setIgObjForm({ name: '', description: '', shopLink: '', price: '' });
      setIgObjPhotoId(null);
      toast.success('Obiect adăugat!');
    } catch { toast.error('Eroare.'); }
    setSubmitting(false);
  };

  const deleteIntGalleryObject = async (interiorId, photoId, objectId) => {
    try {
      await api.delete(`/api/interiors/${interiorId}/gallery/${photoId}/objects/${objectId}`);
      setInteriors(p => p.map(i => i.id === interiorId
        ? { ...i, galleryPhotos: (i.galleryPhotos || []).map(ph => ph.id === photoId ? { ...ph, objects: (ph.objects || []).filter(o => o.id !== objectId) } : ph) }
        : i
      ));
      toast.success('Obiect șters.');
    } catch { toast.error('Eroare.'); }
  };

  // ─── Objects ───
  const createObject = (e) => {
    e.preventDefault();
    submit(async () => {
      const data = new FormData();
      ['name','description','shopLink'].forEach(k => data.append(k, objForm[k]));
      if (objForm.image) data.append('image', objForm.image);
      const res = await api.post(`/api/interiors/${objForm.interiorId}/objects`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (objForm.price || objForm.store) {
        await api.post(`/api/interiors/objects/${res.data.id}/links`, {
          title: objForm.name, url: objForm.shopLink || '#', price: objForm.price, store: objForm.store,
        });
      }
      setObjForm({ interiorId: '', name: '', description: '', shopLink: '', price: '', store: '', image: null });
      const r = await api.get('/api/interiors'); setInteriors(r.data);
    });
  };

  const startEditObject = (obj, interior) => {
    setEditingObject({ ...obj, interiorId: interior.id });
    setObjEditForm({ name: obj.name || '', description: obj.description || '', shopLink: obj.shopLink || '', price: obj.productLinks?.[0]?.price || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditObject = () => { setEditingObject(null); setObjEditForm(emptyObjEditForm); };

  const saveEditObject = (e) => {
    e.preventDefault();
    submit(async () => {
      const data = new FormData();
      ['name','description','shopLink'].forEach(k => { if (objEditForm[k]) data.append(k, objEditForm[k]); });
      await api.put(`/api/interiors/objects/${editingObject.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditingObject(null);
      setObjEditForm(emptyObjEditForm);
      const r = await api.get('/api/interiors'); setInteriors(r.data);
    });
  };

  const deleteObject = async (objectId) => {
    if (!window.confirm('Ștergi obiectul?')) return;
    try {
      await api.delete(`/api/interiors/objects/${objectId}`);
      const r = await api.get('/api/interiors'); setInteriors(r.data);
      toast.success('Obiect șters.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  // ─── Movie Houses ───
  const startEditHouse = (house) => {
    setEditingHouse(house);
    setMhForm({ title: house.title || '', slug: house.slug || '', kicker: house.kicker || '', description: house.description || '', history: house.history || '', image: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditHouse = () => { setEditingHouse(null); setMhForm(emptyMhForm); };

  const saveMovieHouse = (e) => {
    e.preventDefault();
    submit(async () => {
      const data = new FormData();
      ['title','slug','kicker','description','history'].forEach(k => data.append(k, mhForm[k]));
      if (mhForm.image) data.append('image', mhForm.image);
      if (editingHouse) {
        await api.put(`/api/movie-houses/${editingHouse.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setEditingHouse(null);
      } else {
        await api.post('/api/movie-houses', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMhForm(emptyMhForm);
      const r = await api.get('/api/movie-houses'); setHouses(r.data);
    });
  };

  const addGalleryImage = (e) => {
    e.preventDefault();
    if (!mhGallery.houseId || !mhGallery.files.length) { toast.error('Selectează o casă și cel puțin o imagine.'); return; }
    submit(async () => {
      for (const file of mhGallery.files) {
        const data = new FormData();
        data.append('image', file);
        await api.post(`/api/movie-houses/${mhGallery.houseId}/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMhGallery(p => ({ ...p, files: [] }));
      const r = await api.get('/api/movie-houses'); setHouses(r.data);
    });
  };

  const deleteHouseGalleryPhoto = async (houseId, index) => {
    if (!window.confirm('Ștergi această poză din galerie?')) return;
    try {
      const res = await api.delete(`/api/movie-houses/${houseId}/gallery/${index}`);
      setHouses(p => p.map(h => h.id === houseId ? { ...h, gallery: res.data.gallery } : h));
      toast.success('Poză ștearsă.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  const deleteHouse = async (id) => {
    if (!window.confirm('Ștergi movie house-ul?')) return;
    try {
      await api.delete(`/api/movie-houses/${id}`);
      setHouses(p => p.filter(h => h.id !== id));
      toast.success('Șters.');
    } catch { toast.error('Eroare.'); }
  };

  // ─── Locations ───
  const refreshHouses = async () => {
    const r = await api.get('/api/movie-houses');
    setHouses(r.data);
  };

  const createLocation = (houseId) => (e) => {
    e.preventDefault();
    if (!newLocForm.title.trim()) { toast.error('Titlul locației este obligatoriu.'); return; }
    submit(async () => {
      const data = new FormData();
      ['title','kicker','description','history'].forEach(k => { if (newLocForm[k]) data.append(k, newLocForm[k]); });
      if (newLocForm.image) data.append('image', newLocForm.image);
      await api.post(`/api/movie-houses/${houseId}/locations`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewLocForm(emptyLocForm);
      await refreshHouses();
    });
  };

  const startEditLoc = (loc) => {
    setEditingLocId(loc.id);
    setEditLocForm({ title: loc.title || '', kicker: loc.kicker || '', description: loc.description || '', history: loc.history || '', image: null });
  };

  const saveEditLoc = (houseId) => (e) => {
    e.preventDefault();
    submit(async () => {
      const data = new FormData();
      ['title','kicker','description','history'].forEach(k => { if (editLocForm[k]) data.append(k, editLocForm[k]); });
      if (editLocForm.image) data.append('image', editLocForm.image);
      await api.put(`/api/movie-houses/${houseId}/locations/${editingLocId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setEditingLocId(null);
      setEditLocForm(emptyLocForm);
      await refreshHouses();
    });
  };

  const deleteLoc = async (houseId, locId) => {
    if (!window.confirm('Ștergi locația?')) return;
    try {
      await api.delete(`/api/movie-houses/${houseId}/locations/${locId}`);
      await refreshHouses();
      toast.success('Locație ștearsă.');
    } catch { toast.error('Eroare.'); }
  };

  const addLocGallery = (houseId, locId) => async (e) => {
    e.preventDefault();
    const files = locGalleryFiles[locId];
    if (!files?.length) { toast.error('Selectează cel puțin o imagine.'); return; }
    setSubmitting(true);
    try {
      for (const file of files) {
        const data = new FormData();
        data.append('image', file);
        await api.post(`/api/movie-houses/${houseId}/locations/${locId}/gallery`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setLocGalleryFiles(p => ({ ...p, [locId]: [] }));
      await refreshHouses();
      toast.success('Poze adăugate!');
    } catch { toast.error('Eroare.'); }
    setSubmitting(false);
  };

  const deleteLocGalleryPhoto = async (houseId, locId, index) => {
    if (!window.confirm('Ștergi poza?')) return;
    try {
      await api.delete(`/api/movie-houses/${houseId}/locations/${locId}/gallery/${index}`);
      await refreshHouses();
      toast.success('Poză ștearsă.');
    } catch { toast.error('Eroare.'); }
  };

  // ─── Rooms ───
  const startEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({ title: room.title || '', description: room.description || '', order: String(room.order ?? 0), image: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditRoom = () => { setEditingRoom(null); setRoomForm(emptyRoomForm); };

  const saveRoom = (e) => {
    e.preventDefault();
    if (!roomForm.title.trim()) { toast.error('Titlul camerei este obligatoriu.'); return; }
    submit(async () => {
      const data = new FormData();
      data.append('title', roomForm.title);
      if (roomForm.description) data.append('description', roomForm.description);
      if (roomForm.order) data.append('order', roomForm.order);
      if (roomForm.image) data.append('image', roomForm.image);
      if (editingRoom) {
        await api.put(`/api/rooms/${editingRoom.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setEditingRoom(null);
      } else {
        await api.post('/api/rooms', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setRoomForm(emptyRoomForm);
      const r = await api.get('/api/rooms'); setRooms(r.data);
    });
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Ștergi camera?')) return;
    try {
      await api.delete(`/api/rooms/${id}`);
      setRooms(p => p.filter(r => r.id !== id));
      toast.success('Cameră ștearsă.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  // ─── Stories ───
  const startEditStory = (story) => {
    setEditingStory(story);
    setStoryForm({ title: story.title || '', kicker: story.kicker || '', excerpt: story.excerpt || '', content: story.content || '', author: story.author || '', sourceUrl: story.sourceUrl || '', readTime: story.readTime || '', image: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const cancelEditStory = () => { setEditingStory(null); setStoryForm(emptyStoryForm); };

  const saveStory = (e) => {
    e.preventDefault();
    if (!storyForm.title.trim()) { toast.error('Titlul articolului este obligatoriu.'); return; }
    submit(async () => {
      const data = new FormData();
      ['title','kicker','excerpt','content','author','sourceUrl','readTime'].forEach(k => { if (storyForm[k]) data.append(k, storyForm[k]); });
      if (storyForm.image) data.append('image', storyForm.image);
      if (editingStory) {
        await api.put(`/api/stories/${editingStory.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setEditingStory(null);
      } else {
        await api.post('/api/stories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setStoryForm(emptyStoryForm);
      const r = await api.get('/api/stories'); setStories(r.data);
    });
  };

  const deleteStory = async (id) => {
    if (!window.confirm('Ștergi articolul?')) return;
    try {
      await api.delete(`/api/stories/${id}`);
      setStories(p => p.filter(s => s.id !== id));
      toast.success('Articol șters.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>

      {/* Topbar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--text)', color: 'var(--cream)', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', color: 'var(--cream)', textDecoration: 'none' }}>Nestify</Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.7 }}>Admin Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{user?.name}</span>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'var(--cream)' }}>← Înapoi la site</Link>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 56px)' }}>

        {/* Sidebar */}
        <aside style={{ background: 'var(--white)', borderRight: '1px solid var(--card-border)', padding: '28px 16px' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-light)', marginBottom: 12, paddingLeft: 12 }}>Conținut</p>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setSection(s.key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: section === s.key ? 'var(--cream-dark)' : 'transparent', cursor: 'pointer', fontSize: '0.9rem', color: section === s.key ? 'var(--accent)' : 'var(--text)', fontWeight: section === s.key ? 600 : 400, marginBottom: 2 }}>
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </aside>

        <main style={{ padding: '36px 40px' }}>

          {/* ── STILURI ── */}
          {section === 'style' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 6 }}>Stiluri ({styles.length})</h1>
                <p style={{ color: 'var(--text-muted)' }}>Adaugă stiluri noi sau editează-le pe cele existente.</p>
              </div>

              <FormWrap title={editingStyle ? `Editează: ${editingStyle.title}` : 'Adaugă stil nou'} onSubmit={saveStyle} submitting={submitting}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <F label="Titlu" name="title" value={styleForm.title} onChange={field(setStyleForm)} placeholder="Ex: Japandi" />
                  <F label="Slug" name="slug" value={styleForm.slug} onChange={field(setStyleForm)} placeholder="ex: japandi" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Categorie</label>
                  <select name="categoryId" value={styleForm.categoryId} onChange={field(setStyleForm)} style={inputStyle}>
                    <option value="">Selectează categorie…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <F label="Kicker (subtitlu scurt)" name="kicker" value={styleForm.kicker} onChange={field(setStyleForm)} placeholder="Ex: Minimalism nordic" />
                <F label="Descriere" name="description" value={styleForm.description} onChange={field(setStyleForm)} as="textarea" />
                <F label="Influențe / Istoric" name="history" value={styleForm.history} onChange={field(setStyleForm)} as="textarea" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <F label="Perioadă" name="period" value={styleForm.period} onChange={field(setStyleForm)} placeholder="Ex: 1950–prezent" />
                  <F label="Cui i se potrivește" name="audience" value={styleForm.audience} onChange={field(setStyleForm)} />
                </div>
                <F label="Culori (separate prin virgulă)" name="colors" value={styleForm.colors} onChange={field(setStyleForm)} placeholder="Alb, Bej, Lemn natur" />
                <F label="Materiale (separate prin virgulă)" name="materials" value={styleForm.materials} onChange={field(setStyleForm)} placeholder="Lemn deschis, In, Ceramică" />
                <F label={editingStyle ? 'Imagine copertă nouă (opțional)' : 'Imagine copertă'} name="image" type="file" onChange={field(setStyleForm)} />
                {editingStyle && (
                  <button type="button" onClick={cancelEditStyle} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    ✕ Anulează editarea
                  </button>
                )}
              </FormWrap>

              {/* Gallery management */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', maxWidth: 860, marginTop: 20 }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 18 }}>Galerie fotografii cu obiecte</h2>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Selectează stilul</label>
                  <select value={sgStyleId} onChange={e => { setSgStyleId(e.target.value); loadStylePhotos(e.target.value); setSgObjPhotoId(null); }} style={{ ...inputStyle, maxWidth: 360 }}>
                    <option value="">Selectează stilul…</option>
                    {styles.map(s => <option key={s.id} value={s.id}>{s.title} ({s.galleryPhotos?.length || 0} foto)</option>)}
                  </select>
                </div>

                {sgStyleId && (
                  <form onSubmit={addStyleGalleryImage} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', padding: '16px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
                    <div style={{ flex: '0 0 auto' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Imagini noi (multiple)</label>
                      <input type="file" accept="image/*" multiple onChange={e => setSgFiles(Array.from(e.target.files))} style={{ fontSize: '0.85rem' }} />
                      {sgFiles.length > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{sgFiles.length} {sgFiles.length === 1 ? 'fișier selectat' : 'fișiere selectate'}</p>}
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Legendă (opțional)</label>
                      <input value={sgCaption} onChange={e => setSgCaption(e.target.value)} placeholder="Descriere scurtă" style={{ ...inputStyle, padding: '8px 12px' }} />
                    </div>
                    <button type="submit" className="btn btn-ghost btn-sm" disabled={submitting} style={{ flexShrink: 0 }}>+ Adaugă foto</button>
                  </form>
                )}

                {sgStyleId && sgPhotos.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 14 }}>{sgPhotos.length} fotografii</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                      {sgPhotos.map(photo => (
                        <div key={photo.id} style={{ border: '1px solid var(--card-border)', background: 'var(--cream-dark)', overflow: 'hidden' }}>
                          <div style={{ position: 'relative' }}>
                            <img src={API_IMG(photo.imageUrl)} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
                            <button onClick={() => deleteGalleryPhoto(photo.id)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(220,53,69,0.9)', border: 'none', color: '#fff', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>×</button>
                          </div>
                          <div style={{ padding: '10px 12px' }}>
                            {photo.caption && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, fontStyle: 'italic' }}>{photo.caption}</p>}
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 8 }}>{photo.objects?.length || 0} obiecte</p>
                            {photo.objects?.map(obj => (
                              <div key={obj.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 4, padding: '4px 6px', background: 'var(--white)', border: '1px solid var(--card-border)' }}>
                                <span style={{ fontSize: '0.78rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.name}</span>
                                {obj.price && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{obj.price}</span>}
                                <button onClick={() => deleteGalleryPhotoObject(photo.id, obj.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '0.8rem', flexShrink: 0 }}>×</button>
                              </div>
                            ))}
                            {sgObjPhotoId === photo.id ? (
                              <form onSubmit={e => addGalleryPhotoObject(e, photo.id)} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <input value={sgObjForm.name} onChange={e => setSgObjForm(p => ({ ...p, name: e.target.value }))} placeholder="Nume obiect *" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.82rem' }} />
                                <input value={sgObjForm.description} onChange={e => setSgObjForm(p => ({ ...p, description: e.target.value }))} placeholder="Descriere" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.82rem' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                  <input value={sgObjForm.price} onChange={e => setSgObjForm(p => ({ ...p, price: e.target.value }))} placeholder="Preț" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.78rem' }} />
                                  <input value={sgObjForm.shopLink} onChange={e => setSgObjForm(p => ({ ...p, shopLink: e.target.value }))} placeholder="Link shop" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.78rem' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button type="submit" disabled={submitting} style={{ flex: 1, padding: '6px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Salvează</button>
                                  <button type="button" onClick={() => setSgObjPhotoId(null)} style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--card-border)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>✕</button>
                                </div>
                              </form>
                            ) : (
                              <button onClick={() => { setSgObjPhotoId(photo.id); setSgObjForm({ name: '', description: '', shopLink: '', price: '' }); }}
                                style={{ marginTop: 6, width: '100%', padding: '5px', background: 'none', border: '1px dashed var(--card-border)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                + Adaugă obiect
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sgStyleId && sgPhotos.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nu există fotografii în galeria acestui stil.</p>}
              </div>

              {/* Styles list */}
              <div style={{ marginTop: 36 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 16 }}>Stiluri existente</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {styles.map(s => {
                    const sGallery = s.galleryPhotos || [];
                    return (
                      <div key={s.id} style={{ background: editingStyle?.id === s.id ? 'var(--cream-dark)' : 'var(--white)', border: `1px solid ${editingStyle?.id === s.id ? 'var(--accent)' : 'var(--card-border)'}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        {/* Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
                          {s.imageUrl && <img src={API_IMG(s.imageUrl)} alt="" style={{ width: 48, height: 36, objectFit: 'cover', flexShrink: 0 }} />}
                          <Link to={`/styles/${s.slug}`} style={{ fontWeight: 600, textDecoration: 'none', color: 'var(--text)', flex: 1 }}>{s.title}</Link>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.images?.length || 0} interioare</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>{s.slug}</span>
                          <button
                            onClick={() => setStyleGalleryPanel(styleGalleryPanel === s.id ? null : s.id)}
                            style={{ background: 'none', border: '1px solid var(--card-border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}
                          >
                            📷 {sGallery.length} {styleGalleryPanel === s.id ? '▲' : '▼'}
                          </button>
                          <button onClick={() => startEditStyle(s)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>Editează</button>
                        </div>

                        {/* Gallery panel */}
                        {styleGalleryPanel === s.id && (
                          <div style={{ borderTop: '1px solid var(--card-border)', padding: '14px 16px', background: 'var(--cream)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 12 }}>Galerie fotografii — {s.title}</p>

                            {sGallery.length > 0 ? (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 14 }}>
                                {sGallery.map(photo => (
                                  <div key={photo.id} style={{ position: 'relative', background: 'var(--cream-dark)' }}>
                                    <img src={API_IMG(photo.imageUrl)} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
                                    {photo.objects?.length > 0 && (
                                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(26,20,16,0.7)', color: '#fff', fontSize: '0.65rem', padding: '3px 6px', textAlign: 'center' }}>
                                        {photo.objects.length} obiect{photo.objects.length !== 1 ? 'e' : ''}
                                      </div>
                                    )}
                                    <button
                                      onClick={() => deleteStyleGalleryPhotoInline(s.id, photo.id)}
                                      style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, background: 'rgba(220,53,69,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                                    >×</button>
                                    {photo.caption && (
                                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '3px 4px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.caption}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12 }}>Nu există fotografii în galerie.</p>
                            )}

                            <form onSubmit={addStyleGalleryInline(s.id)} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                type="file" accept="image/*" multiple
                                onChange={e => setStyleGalleryFiles(p => ({ ...p, [s.id]: Array.from(e.target.files) }))}
                                style={{ fontSize: '0.78rem', flex: 1, minWidth: 160 }}
                              />
                              {styleGalleryFiles[s.id]?.length > 0 && (
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{styleGalleryFiles[s.id].length} fișiere</span>
                              )}
                              <button type="submit" disabled={submitting} style={{ padding: '5px 12px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0, borderRadius: 'var(--radius-sm)' }}>
                                + Adaugă poze
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── INTERIOARE ── */}
          {section === 'interior' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 6 }}>Interioare ({interiors.length})</h1>
                <p style={{ color: 'var(--text-muted)' }}>Adaugă camere reprezentative etichetate cu stil și tip de cameră.</p>
              </div>

              <FormWrap title={editingInterior ? `Editează: ${editingInterior.title}` : 'Adaugă interior'} onSubmit={saveInterior} submitting={submitting}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Stil</label>
                  <select name="styleId" value={intForm.styleId} onChange={field(setIntForm)} style={inputStyle}>
                    <option value="">Selectează stil…</option>
                    {styles.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <F label="Titlu" name="title" value={intForm.title} onChange={field(setIntForm)} placeholder="Ex: Living luminos nordic" />
                  <F label="Slug" name="slug" value={intForm.slug} onChange={field(setIntForm)} placeholder="living-luminos-nordic" />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Tip cameră</label>
                  <select name="roomType" value={intForm.roomType} onChange={field(setIntForm)} style={inputStyle}>
                    <option value="">Fără tip cameră</option>
                    {rooms.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                  </select>
                </div>
                <F label="Subtitlu" name="subtitle" value={intForm.subtitle} onChange={field(setIntForm)} placeholder="Ex: Texturi moi și lemn natur" />
                <F label="Descriere" name="description" value={intForm.description} onChange={field(setIntForm)} as="textarea" />
                <F label={editingInterior ? 'Imagine nouă (opțional)' : 'Imagine'} name="image" type="file" onChange={field(setIntForm)} />
                {editingInterior && (
                  <button type="button" onClick={cancelEditInterior} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    ✕ Anulează editarea
                  </button>
                )}
              </FormWrap>

              {interiors.length > 0 && (
                <div style={{ marginTop: 36 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 16 }}>Interioare existente</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {interiors.map(interior => {
                      const intGallery = interior.galleryPhotos || [];
                      return (
                        <div key={interior.id} style={{ background: editingInterior?.id === interior.id ? 'var(--cream-dark)' : 'var(--white)', border: `1px solid ${editingInterior?.id === interior.id ? 'var(--accent)' : 'var(--card-border)'}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                          {/* Row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
                            {interior.imageUrl
                              ? <img src={API_IMG(interior.imageUrl)} alt="" style={{ width: 60, height: 44, objectFit: 'cover', flexShrink: 0, display: 'block' }} />
                              : <div style={{ width: 60, height: 44, background: 'var(--cream-dark)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ opacity: 0.3 }}>🛋️</span></div>
                            }
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{interior.title}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {interior.style?.title || '—'}{interior.roomType ? ` · ${interior.roomType}` : ''}
                              </p>
                            </div>
                            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-light)', flexShrink: 0 }}>{interior.slug}</span>
                            <button
                              onClick={() => setIntGalleryPanel(intGalleryPanel === interior.id ? null : interior.id)}
                              style={{ background: 'none', border: '1px solid var(--card-border)', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}
                            >
                              📷 {intGallery.length} {intGalleryPanel === interior.id ? '▲' : '▼'}
                            </button>
                            <button onClick={() => startEditInterior(interior)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>Editează</button>
                            <button onClick={() => deleteInterior(interior.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0 }}>Șterge</button>
                          </div>

                          {/* Gallery panel */}
                          {intGalleryPanel === interior.id && (
                            <div style={{ borderTop: '1px solid var(--card-border)', padding: '14px 16px', background: 'var(--cream)' }}>
                              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 14 }}>Galerie fotografii</p>

                              {intGallery.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                                  {intGallery.map(photo => (
                                    <div key={photo.id} style={{ border: '1px solid var(--card-border)', background: 'var(--white)', overflow: 'hidden' }}>
                                      {/* Photo header */}
                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px' }}>
                                        <img src={API_IMG(photo.imageUrl)} alt="" style={{ width: 90, height: 66, objectFit: 'cover', flexShrink: 0, display: 'block' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          {photo.caption && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 4 }}>{photo.caption}</p>}
                                          <p style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{(photo.objects || []).length} obiecte</p>
                                        </div>
                                        <button onClick={() => deleteIntGalleryPhoto(interior.id, photo.id)}
                                          style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0, borderRadius: 'var(--radius-sm)' }}>
                                          Șterge foto
                                        </button>
                                      </div>

                                      {/* Objects */}
                                      <div style={{ padding: '0 12px 10px' }}>
                                        {(photo.objects || []).map(obj => (
                                          <div key={obj.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'var(--cream-dark)', marginBottom: 4, borderRadius: 'var(--radius-sm)' }}>
                                            <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.name}</span>
                                            {obj.price && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{obj.price}</span>}
                                            {obj.shopLink && <a href={obj.shopLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--accent)', flexShrink: 0 }}>Link</a>}
                                            <button onClick={() => deleteIntGalleryObject(interior.id, photo.id, obj.id)}
                                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '0.8rem', flexShrink: 0, lineHeight: 1 }}>×</button>
                                          </div>
                                        ))}

                                        {/* Add object form */}
                                        {igObjPhotoId === photo.id ? (
                                          <form onSubmit={addIntGalleryObject(interior.id, photo.id)} style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <input value={igObjForm.name} onChange={e => setIgObjForm(p => ({ ...p, name: e.target.value }))} placeholder="Nume obiect *" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.82rem' }} />
                                            <input value={igObjForm.description} onChange={e => setIgObjForm(p => ({ ...p, description: e.target.value }))} placeholder="Descriere" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.82rem' }} />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                              <input value={igObjForm.price} onChange={e => setIgObjForm(p => ({ ...p, price: e.target.value }))} placeholder="Preț (ex: 299 RON)" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.78rem' }} />
                                              <input value={igObjForm.shopLink} onChange={e => setIgObjForm(p => ({ ...p, shopLink: e.target.value }))} placeholder="Link magazin" style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.78rem' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                              <button type="submit" disabled={submitting} style={{ flex: 1, padding: '6px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)' }}>Salvează obiect</button>
                                              <button type="button" onClick={() => { setIgObjPhotoId(null); setIgObjForm({ name: '', description: '', shopLink: '', price: '' }); }} style={{ padding: '6px 10px', background: 'none', border: '1px solid var(--card-border)', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>✕</button>
                                            </div>
                                          </form>
                                        ) : (
                                          <button onClick={() => { setIgObjPhotoId(photo.id); setIgObjForm({ name: '', description: '', shopLink: '', price: '' }); }}
                                            style={{ marginTop: 6, width: '100%', padding: '5px', background: 'none', border: '1px dashed var(--card-border)', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-muted)', borderRadius: 'var(--radius-sm)' }}>
                                            + Adaugă obiect
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Upload new photos */}
                              <form onSubmit={addIntGallery(interior.id)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)' }}>
                                <input type="file" accept="image/*" multiple
                                  onChange={e => setIntGalleryFiles(p => ({ ...p, [interior.id]: Array.from(e.target.files) }))}
                                  style={{ fontSize: '0.78rem', flex: 1 }}
                                />
                                {intGalleryFiles[interior.id]?.length > 0 && (
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{intGalleryFiles[interior.id].length} fișiere</span>
                                )}
                                <button type="submit" disabled={submitting} style={{ padding: '5px 12px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: '0.75rem', flexShrink: 0, borderRadius: 'var(--radius-sm)' }}>
                                  + Adaugă poze
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {interiors.length === 0 && <p style={{ marginTop: 24, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Nu există interioare adăugate încă.</p>}
            </div>
          )}

          {/* ── OBIECTE ── */}
          {section === 'object' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 6 }}>Obiecte & Produse</h1>
                <p style={{ color: 'var(--text-muted)' }}>Adaugă sau editează obiecte de mobilier asociate unui interior.</p>
              </div>

              {/* Add form / Edit form */}
              {editingObject ? (
                <form onSubmit={saveEditObject} style={{ background: 'var(--white)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', maxWidth: 640, marginBottom: 32 }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', marginBottom: 22 }}>Editează: {editingObject.name}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <F label="Denumire *" name="name" value={objEditForm.name} onChange={e => setObjEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Canapea crem IKEA" />
                    <F label="Descriere" name="description" value={objEditForm.description} onChange={e => setObjEditForm(p => ({ ...p, description: e.target.value }))} as="textarea" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <F label="Link magazin" name="shopLink" value={objEditForm.shopLink} onChange={e => setObjEditForm(p => ({ ...p, shopLink: e.target.value }))} placeholder="https://…" />
                      <F label="Preț" name="price" value={objEditForm.price} onChange={e => setObjEditForm(p => ({ ...p, price: e.target.value }))} placeholder="Ex: 1.299 RON" />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" className="btn btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>{submitting ? 'Se salvează…' : 'Salvează →'}</button>
                      <button type="button" onClick={cancelEditObject} style={{ background: 'none', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>✕ Anulează</button>
                    </div>
                  </div>
                </form>
              ) : (
                <FormWrap title="Adaugă obiect nou" onSubmit={createObject} submitting={submitting}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Interior</label>
                    <select name="interiorId" value={objForm.interiorId} onChange={field(setObjForm)} style={inputStyle}>
                      <option value="">Selectează interior…</option>
                      {interiors.map(i => <option key={i.id} value={i.id}>{i.title} — {i.style?.title || ''}</option>)}
                    </select>
                  </div>
                  <F label="Denumire obiect" name="name" value={objForm.name} onChange={field(setObjForm)} placeholder="Ex: Canapea crem IKEA" />
                  <F label="Descriere" name="description" value={objForm.description} onChange={field(setObjForm)} as="textarea" placeholder="Materiale, dimensiuni, culori…" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <F label="Link magazin / produs" name="shopLink" value={objForm.shopLink} onChange={field(setObjForm)} placeholder="https://…" />
                    <F label="Preț (ex: 1.299 RON)" name="price" value={objForm.price} onChange={field(setObjForm)} placeholder="Ex: 1.299 RON" />
                  </div>
                  <F label="Magazin / Sursă" name="store" value={objForm.store} onChange={field(setObjForm)} placeholder="Ex: IKEA, Zara Home, Westwing" />
                  <F label="Imagine produs" name="image" type="file" onChange={field(setObjForm)} />
                </FormWrap>
              )}

              {/* Objects list grouped by interior */}
              {interiors.filter(i => i.objects?.length > 0).length > 0 && (
                <div style={{ marginTop: 36 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 16 }}>Obiecte existente</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {interiors.filter(i => i.objects?.length > 0).map(interior => (
                      <div key={interior.id} style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 16px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          {interior.imageUrl && <img src={API_IMG(interior.imageUrl)} alt="" style={{ width: 36, height: 26, objectFit: 'cover', flexShrink: 0 }} />}
                          <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', flex: 1 }}>{interior.title}</p>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{interior.style?.title} · {interior.objects.length} obiecte</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                          {interior.objects.map((obj, idx) => (
                            <div key={obj.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: idx < interior.objects.length - 1 ? '1px solid var(--card-border)' : 'none', background: editingObject?.id === obj.id ? 'var(--cream-dark)' : 'transparent' }}>
                              {obj.imageUrl && <img src={API_IMG(obj.imageUrl)} alt="" style={{ width: 44, height: 44, objectFit: 'cover', flexShrink: 0, borderRadius: 4 }} />}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.name}</p>
                                {obj.description && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.description}</p>}
                              </div>
                              {obj.productLinks?.[0]?.price && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>{obj.productLinks[0].price}</span>}
                              {obj.shopLink && <a href={obj.shopLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: 'var(--accent)', flexShrink: 0 }}>Link</a>}
                              <button onClick={() => startEditObject(obj, interior)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0 }}>Editează</button>
                              <button onClick={() => deleteObject(obj.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: 'var(--radius-sm)', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}>Șterge</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CATEGORII ── */}
          {section === 'category' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 6 }}>Categorii ({categories.length})</h1>
                <p style={{ color: 'var(--text-muted)' }}>Categoriile grupează stilurile (ex: Minimalist, Clasic, Ecletic).</p>
              </div>

              <FormWrap title={editingCat ? `Editează: ${editingCat.name}` : 'Adaugă categorie'} onSubmit={createCategory} submitting={submitting}>
                <F label="Denumire *" name="name" value={catForm.name} onChange={field(setCatForm)} placeholder="Ex: Minimalist" />
                <F label="Slug *" name="slug" value={catForm.slug} onChange={field(setCatForm)} placeholder="minimalist" />
                <F label="Descriere" name="description" value={catForm.description} onChange={field(setCatForm)} as="textarea" />
                {editingCat && (
                  <button type="button" onClick={cancelEditCat} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    ✕ Anulează editarea
                  </button>
                )}
              </FormWrap>

              {categories.length > 0 && (
                <div style={{ marginTop: 28 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 14 }}>Categorii existente</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {categories.map(c => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: editingCat?.id === c.id ? 'var(--cream-dark)' : 'var(--white)', border: `1px solid ${editingCat?.id === c.id ? 'var(--accent)' : 'var(--card-border)'}`, borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 2 }}>{c.name}</p>
                          {c.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</p>}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-light)', flexShrink: 0 }}>{c.slug}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>{styles.filter(s => s.categoryId === c.id).length} stiluri</span>
                        <button onClick={() => startEditCat(c)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>Editează</button>
                        <button onClick={() => deleteCategory(c.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0 }}>Șterge</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CAMERE ── */}
          {section === 'room' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 6 }}>Camere ({rooms.length})</h1>
                <p style={{ color: 'var(--text-muted)' }}>Adaugă tipuri de camere pentru secțiunea "Caută după cameră" de pe homepage.</p>
              </div>

              <FormWrap title={editingRoom ? `Editează: ${editingRoom.title}` : 'Adaugă cameră'} onSubmit={saveRoom} submitting={submitting}>
                <F label="Titlu *" name="title" value={roomForm.title} onChange={field(setRoomForm)} placeholder="Ex: Living, Dormitor, Bucătărie" />
                <F label="Descriere (opțional)" name="description" value={roomForm.description} onChange={field(setRoomForm)} placeholder="Scurtă descriere a tipului de cameră" />
                <F label="Ordine afișare" name="order" type="number" value={roomForm.order} onChange={field(setRoomForm)} placeholder="0" />
                <F label={editingRoom ? 'Imagine nouă (opțional)' : 'Imagine'} name="image" type="file" onChange={field(setRoomForm)} />
                {editingRoom && (
                  <button type="button" onClick={cancelEditRoom} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    ✕ Anulează editarea
                  </button>
                )}
              </FormWrap>

              {rooms.length > 0 && (
                <div style={{ marginTop: 36 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 16 }}>Camere existente</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {rooms.map(room => (
                      <div key={room.id} style={{ background: editingRoom?.id === room.id ? 'var(--cream-dark)' : 'var(--white)', border: `1px solid ${editingRoom?.id === room.id ? 'var(--accent)' : 'var(--card-border)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                        {room.imageUrl
                          ? <img src={API_IMG(room.imageUrl)} alt={room.title} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block' }} />
                          : <div style={{ width: '100%', height: 130, background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '2rem', opacity: 0.3 }}>🏠</span></div>
                        }
                        <div style={{ padding: '12px 14px' }}>
                          <h4 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', marginBottom: 4 }}>{room.title}</h4>
                          {room.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5 }}>{room.description}</p>}
                          <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: 10 }}>Ordine: {room.order}</p>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => startEditRoom(room)} style={{ flex: 1, background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Editează</button>
                            <button onClick={() => deleteRoom(room.id)} style={{ flex: 1, background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: 'var(--radius-sm)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.78rem' }}>Șterge</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rooms.length === 0 && <p style={{ marginTop: 24, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Nu există camere adăugate încă.</p>}
            </div>
          )}

          {/* ── ARTICOLE ── */}
          {section === 'story' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 6 }}>Articole ({stories.length})</h1>
                <p style={{ color: 'var(--text-muted)' }}>Adaugă articole editoriale pentru secțiunea "Povești recente" de pe homepage.</p>
              </div>

              <FormWrap title={editingStory ? `Editează: ${editingStory.title}` : 'Adaugă articol'} onSubmit={saveStory} submitting={submitting}>
                <F label="Titlu *" name="title" value={storyForm.title} onChange={field(setStoryForm)} placeholder="Ex: Minimalismul ca formă de libertate" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <F label="Kicker (etichetă)" name="kicker" value={storyForm.kicker} onChange={field(setStoryForm)} placeholder="Ex: Popular, Trending, Exclusiv" />
                  <F label="Timp de citire" name="readTime" value={storyForm.readTime} onChange={field(setStoryForm)} placeholder="Ex: 5 min" />
                </div>
                <F label="Autor" name="author" value={storyForm.author} onChange={field(setStoryForm)} placeholder="Ex: Maria Ionescu" />
                <F label="Link sursă originală (opțional)" name="sourceUrl" value={storyForm.sourceUrl} onChange={field(setStoryForm)} placeholder="https://…" />
                <F label="Rezumat (excerpt)" name="excerpt" value={storyForm.excerpt} onChange={field(setStoryForm)} as="textarea" placeholder="Un scurt rezumat al articolului…" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)' }}>Conținut articol</label>
                  <textarea name="content" value={storyForm.content} onChange={field(setStoryForm)} placeholder="Textul complet al articolului…" rows={10} style={{ padding: '10px 14px', border: '1.5px solid var(--card-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.92rem', background: 'var(--cream)', outline: 'none', width: '100%', resize: 'vertical' }} />
                </div>
                <F label={editingStory ? 'Imagine copertă nouă (opțional)' : 'Imagine copertă'} name="image" type="file" onChange={field(setStoryForm)} />
                {editingStory && (
                  <button type="button" onClick={cancelEditStory} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    ✕ Anulează editarea
                  </button>
                )}
              </FormWrap>

              {stories.length > 0 && (
                <div style={{ marginTop: 36 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 16 }}>Articole existente</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stories.map(story => (
                      <div key={story.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: editingStory?.id === story.id ? 'var(--cream-dark)' : 'var(--white)', border: `1px solid ${editingStory?.id === story.id ? 'var(--accent)' : 'var(--card-border)'}`, borderRadius: 'var(--radius-sm)' }}>
                        {story.imageUrl
                          ? <img src={API_IMG(story.imageUrl)} alt={story.title} style={{ width: 60, height: 44, objectFit: 'cover', flexShrink: 0, display: 'block' }} />
                          : <div style={{ width: 60, height: 44, background: 'var(--cream-dark)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '1.2rem', opacity: 0.3 }}>📖</span></div>
                        }
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story.title}</p>
                          {story.excerpt && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story.excerpt}</p>}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', flexShrink: 0 }}>{new Date(story.publishedAt).toLocaleDateString('ro-RO')}</span>
                        <span style={{ fontSize: '0.72rem', background: 'var(--cream-dark)', padding: '2px 8px', borderRadius: 20, color: 'var(--text-muted)', flexShrink: 0 }}>{story.kicker || 'Popular'}</span>
                        <Link to={`/stories/${story.id}`} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px', fontSize: '0.78rem', flexShrink: 0 }}>Vizualizează</Link>
                        <button onClick={() => startEditStory(story)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>Editează</button>
                        <button onClick={() => deleteStory(story.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0 }}>Șterge</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stories.length === 0 && <p style={{ marginTop: 24, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Nu există articole adăugate încă.</p>}
            </div>
          )}

          {/* ── MOVIE HOUSES ── */}
          {section === 'moviehouse' && (
            <div>
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.8rem', marginBottom: 6 }}>Movie Houses ({houses.length})</h1>
                <p style={{ color: 'var(--text-muted)' }}>Case iconice din filme. Adaugă, editează sau șterge case și poze din galerie.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
                <FormWrap title={editingHouse ? `Editează: ${editingHouse.title}` : 'Adaugă Movie House'} onSubmit={saveMovieHouse} submitting={submitting}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <F label="Titlu" name="title" value={mhForm.title} onChange={field(setMhForm)} placeholder="Ex: Casa din Parasite" />
                    <F label="Slug" name="slug" value={mhForm.slug} onChange={field(setMhForm)} placeholder="casa-parasite" />
                  </div>
                  <F label="Kicker" name="kicker" value={mhForm.kicker} onChange={field(setMhForm)} placeholder="Ex: Thriller coreean" />
                  <F label="Descriere" name="description" value={mhForm.description} onChange={field(setMhForm)} as="textarea" />
                  <F label="Context cinematografic" name="history" value={mhForm.history} onChange={field(setMhForm)} as="textarea" />
                  <F label={editingHouse ? 'Imagine copertă nouă (opțional)' : 'Imagine copertă'} name="image" type="file" onChange={field(setMhForm)} />
                  {editingHouse && (
                    <button type="button" onClick={cancelEditHouse} style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      ✕ Anulează editarea
                    </button>
                  )}
                </FormWrap>

                <form onSubmit={addGalleryImage} style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px' }}>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 18 }}>Adaugă imagini în galerie</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Movie House</label>
                      <select value={mhGallery.houseId} onChange={e => setMhGallery(p => ({ ...p, houseId: e.target.value }))} style={inputStyle}>
                        <option value="">Selectează…</option>
                        {houses.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', display: 'block', marginBottom: 6 }}>Imagini (multiple)</label>
                      <input type="file" accept="image/*" multiple onChange={e => setMhGallery(p => ({ ...p, files: Array.from(e.target.files) }))} style={{ fontSize: '0.88rem' }} />
                      {mhGallery.files.length > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{mhGallery.files.length} fișiere selectate</p>}
                    </div>
                    <button type="submit" className="btn btn-ghost btn-sm" disabled={submitting} style={{ alignSelf: 'flex-start' }}>Adaugă în galerie</button>
                  </div>
                </form>
              </div>

              {/* Houses list with gallery management */}
              {houses.length > 0 && (
                <div style={{ marginTop: 36 }}>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 16 }}>Movie Houses existente</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {houses.map(h => {
                      const gallery = Array.isArray(h.gallery) ? h.gallery : [];
                      return (
                        <div key={h.id} style={{ background: editingHouse?.id === h.id ? 'var(--cream-dark)' : 'var(--white)', border: `1px solid ${editingHouse?.id === h.id ? 'var(--accent)' : 'var(--card-border)'}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                          <div style={{ display: 'flex', gap: 16, padding: '14px 16px', alignItems: 'flex-start' }}>
                            {h.imageUrl
                              ? <img src={API_IMG(h.imageUrl)} alt={h.title} style={{ width: 80, height: 60, objectFit: 'cover', flexShrink: 0, display: 'block' }} />
                              : <div style={{ width: 80, height: 60, background: 'var(--cream-dark)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '1.5rem', opacity: 0.3 }}>🎬</span></div>
                            }
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1rem', fontWeight: 600, marginBottom: 2 }}>{h.title}</p>
                              {h.kicker && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{h.kicker}</p>}
                              <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>{h.slug}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                              <Link to={`/movie-houses/${h.slug}`} className="btn btn-ghost btn-sm">Vizualizează</Link>
                              <button onClick={() => startEditHouse(h)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Editează</button>
                              <button onClick={() => deleteHouse(h.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78rem' }}>Șterge</button>
                            </div>
                          </div>

                          {/* Gallery thumbnails with delete */}
                          {gallery.length > 0 && (
                            <div style={{ borderTop: '1px solid var(--card-border)', padding: '12px 16px', background: 'var(--cream-dark)' }}>
                              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 10 }}>{gallery.length} poze în galerie principală</p>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {gallery.map((url, idx) => (
                                  <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                                    <img src={API_IMG(url)} alt="" style={{ width: 72, height: 54, objectFit: 'cover', display: 'block' }} />
                                    <button onClick={() => deleteHouseGalleryPhoto(h.id, idx)} style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, background: 'rgba(220,53,69,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Locations panel */}
                          <div style={{ borderTop: '1px solid var(--card-border)' }}>
                            <button
                              onClick={() => setLocPanelHouseId(locPanelHouseId === h.id ? null : h.id)}
                              style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                              <span style={{ fontSize: '0.65rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                🏛️ Locații ({h.locations?.length || 0}) {locPanelHouseId === h.id ? '▲' : '▼'}
                              </span>
                            </button>

                            {locPanelHouseId === h.id && (
                              <div style={{ padding: '0 16px 16px', background: 'var(--cream)' }}>

                                {/* Existing locations */}
                                {(h.locations || []).map(loc => (
                                  <div key={loc.id} style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', marginBottom: 12, background: 'var(--white)', overflow: 'hidden' }}>
                                    {editingLocId === loc.id ? (
                                      <form onSubmit={saveEditLoc(h.id)} style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', marginBottom: 4 }}>Editează locație</p>
                                        <input value={editLocForm.title} onChange={e => setEditLocForm(p => ({ ...p, title: e.target.value }))} placeholder="Titlu *" style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.85rem' }} />
                                        <input value={editLocForm.kicker} onChange={e => setEditLocForm(p => ({ ...p, kicker: e.target.value }))} placeholder="Kicker (ex: Casa din Napa Valley)" style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.85rem' }} />
                                        <textarea value={editLocForm.description} onChange={e => setEditLocForm(p => ({ ...p, description: e.target.value }))} placeholder="Descriere" rows={2} style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem', resize: 'vertical' }} />
                                        <textarea value={editLocForm.history} onChange={e => setEditLocForm(p => ({ ...p, history: e.target.value }))} placeholder="Context cinematografic" rows={2} style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem', resize: 'vertical' }} />
                                        <div>
                                          <label style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Imagine copertă locație (opțional)</label>
                                          <input type="file" accept="image/*" onChange={e => setEditLocForm(p => ({ ...p, image: e.target.files[0] }))} style={{ fontSize: '0.82rem' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                          <button type="submit" disabled={submitting} style={{ flex: 1, padding: '7px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}>Salvează</button>
                                          <button type="button" onClick={() => { setEditingLocId(null); setEditLocForm(emptyLocForm); }} style={{ padding: '7px 12px', background: 'none', border: '1px solid var(--card-border)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)' }}>✕</button>
                                        </div>
                                      </form>
                                    ) : (
                                      <>
                                        <div style={{ display: 'flex', gap: 12, padding: '10px 12px', alignItems: 'center' }}>
                                          {loc.imageUrl
                                            ? <img src={API_IMG(loc.imageUrl)} alt="" style={{ width: 56, height: 42, objectFit: 'cover', flexShrink: 0 }} />
                                            : <div style={{ width: 56, height: 42, background: 'var(--cream-dark)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ opacity: 0.3 }}>🏛️</span></div>
                                          }
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.title}</p>
                                            {loc.kicker && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{loc.kicker}</p>}
                                            <p style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>{Array.isArray(loc.gallery) ? loc.gallery.length : 0} poze</p>
                                          </div>
                                          <button onClick={() => startEditLoc(loc)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '3px 10px', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}>Editează</button>
                                          <button onClick={() => deleteLoc(h.id, loc.id)} style={{ background: 'none', border: '1px solid #dc3545', color: '#dc3545', borderRadius: 'var(--radius-sm)', padding: '3px 8px', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}>✕</button>
                                        </div>

                                        {/* Location gallery thumbnails */}
                                        {Array.isArray(loc.gallery) && loc.gallery.length > 0 && (
                                          <div style={{ borderTop: '1px solid var(--card-border)', padding: '8px 12px', background: 'var(--cream-dark)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                            {loc.gallery.map((url, idx) => (
                                              <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                                                <img src={API_IMG(url)} alt="" style={{ width: 56, height: 42, objectFit: 'cover', display: 'block' }} />
                                                <button onClick={() => deleteLocGalleryPhoto(h.id, loc.id, idx)} style={{ position: 'absolute', top: 1, right: 1, width: 16, height: 16, background: 'rgba(220,53,69,0.9)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Add gallery photos to location */}
                                        <form onSubmit={addLocGallery(h.id, loc.id)} style={{ borderTop: '1px solid var(--card-border)', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                                          <input type="file" accept="image/*" multiple onChange={e => setLocGalleryFiles(p => ({ ...p, [loc.id]: Array.from(e.target.files) }))} style={{ fontSize: '0.78rem', flex: 1 }} />
                                          {locGalleryFiles[loc.id]?.length > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{locGalleryFiles[loc.id].length} fișiere</span>}
                                          <button type="submit" disabled={submitting} style={{ padding: '4px 10px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: '0.72rem', flexShrink: 0 }}>+ Poze</button>
                                        </form>
                                      </>
                                    )}
                                  </div>
                                ))}

                                {/* Add new location form */}
                                <form onSubmit={createLocation(h.id)} style={{ border: '1px dashed var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '14px', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                  <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 4 }}>+ Adaugă locație nouă</p>
                                  <input value={newLocForm.title} onChange={e => setNewLocForm(p => ({ ...p, title: e.target.value }))} placeholder="Titlu locație * (ex: Casa din Napa Valley)" style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.85rem' }} />
                                  <input value={newLocForm.kicker} onChange={e => setNewLocForm(p => ({ ...p, kicker: e.target.value }))} placeholder="Kicker (ex: Luxury Countryside)" style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.85rem' }} />
                                  <textarea value={newLocForm.description} onChange={e => setNewLocForm(p => ({ ...p, description: e.target.value }))} placeholder="Descriere locație" rows={2} style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem', resize: 'vertical' }} />
                                  <textarea value={newLocForm.history} onChange={e => setNewLocForm(p => ({ ...p, history: e.target.value }))} placeholder="Context cinematografic pentru această locație" rows={2} style={{ ...inputStyle, padding: '7px 10px', fontSize: '0.82rem', resize: 'vertical' }} />
                                  <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'block', marginBottom: 4 }}>Imagine copertă locație</label>
                                    <input type="file" accept="image/*" onChange={e => setNewLocForm(p => ({ ...p, image: e.target.files[0] }))} style={{ fontSize: '0.82rem' }} />
                                  </div>
                                  <button type="submit" disabled={submitting} style={{ alignSelf: 'flex-start', padding: '7px 18px', background: 'var(--text)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: '0.78rem', borderRadius: 'var(--radius-sm)' }}>
                                    {submitting ? 'Se salvează…' : 'Adaugă locație'}
                                  </button>
                                </form>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';

const API_URL = 'http://localhost:5000';
const imgUrl = (url) => (!url ? null : url.startsWith('http') ? url : `${API_URL}${url}`);

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState({ title: '', description: '' });
  const [taskInputs,   setTaskInputs]   = useState({});
  const [expanded,     setExpanded]     = useState({});
  const [activeTab,    setActiveTab]    = useState({});   // 'tasks' | 'inspirations' | 'moodboards'
  const [inspCaption,  setInspCaption]  = useState({});
  const [deleteConf,   setDeleteConf]   = useState(null); // project id awaiting confirm
  const fileRefs = useRef({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login?message=auth-required'); return; }
    api.get('/api/projects')
      .then(r => { setProjects(r.data); })
      .catch(() => toast.error('Eroare la încărcarea proiectelor.'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Titlul este obligatoriu.'); return; }
    try {
      const res = await api.post('/api/projects', form);
      setProjects(p => [{ ...res.data, tasks: [], inspirations: [], moodboards: [] }, ...p]);
      setForm({ title: '', description: '' });
      setShowForm(false);
      setExpanded(prev => ({ ...prev, [res.data.id]: true }));
      setActiveTab(prev => ({ ...prev, [res.data.id]: 'tasks' }));
      toast.success('Proiect creat!');
    } catch { toast.error('Eroare la creare.'); }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(p => p.filter(proj => proj.id !== id));
      setDeleteConf(null);
      toast.success('Proiect șters.');
    } catch { toast.error('Eroare la ștergere.'); }
  };

  const handleCreateTask = async (projectId) => {
    const text = taskInputs[projectId]?.trim();
    if (!text) return;
    try {
      const res = await api.post(`/api/project-tasks/${projectId}`, { text });
      setProjects(p => p.map(proj =>
        proj.id === projectId ? { ...proj, tasks: [...(proj.tasks || []), res.data] } : proj
      ));
      setTaskInputs(p => ({ ...p, [projectId]: '' }));
    } catch { toast.error('Eroare la adăugarea taskului.'); }
  };

  const handleToggleTask = async (taskId, projectId) => {
    try {
      const res = await api.patch(`/api/project-tasks/${taskId}/toggle`);
      setProjects(p => p.map(proj =>
        proj.id === projectId
          ? { ...proj, tasks: (proj.tasks || []).map(t => t.id === taskId ? res.data : t) }
          : proj
      ));
    } catch { toast.error('Eroare la actualizare.'); }
  };

  const handleUploadInsp = async (projectId) => {
    const file = fileRefs.current[projectId]?.files[0];
    if (!file) { toast.error('Alege o imagine.'); return; }
    try {
      const data = new FormData();
      data.append('image', file);
      data.append('caption', inspCaption[projectId] || '');
      const res = await api.post(`/api/project-inspirations/${projectId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProjects(p => p.map(proj =>
        proj.id === projectId
          ? { ...proj, inspirations: [res.data, ...(proj.inspirations || [])] }
          : proj
      ));
      if (fileRefs.current[projectId]) fileRefs.current[projectId].value = '';
      setInspCaption(p => ({ ...p, [projectId]: '' }));
      toast.success('Inspirație adăugată!');
    } catch { toast.error('Eroare la upload.'); }
  };

  const getTab = (id) => activeTab[id] || 'tasks';

  if (loading) return <div className="museum-home"><Navbar /><div className="loading-spinner" /></div>;

  return (
    <div className="museum-home">
      <Navbar />

      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)', borderBottom: '1px solid var(--card-border)' }}>
        <span className="museum-kicker">Planificare personală</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          Proiectele mele
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.8, marginBottom: 28, fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
          Organizează ideile de amenajare, creează task-uri și colectează imagini de inspirație pentru fiecare cameră.
        </p>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Anulează' : '+ Proiect nou'}
        </button>
      </div>

      <main style={{ padding: '48px 48px 100px', maxWidth: 860, margin: '0 auto' }}>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreateProject}
            style={{ background: 'var(--white)', border: '1px solid var(--card-border)', padding: '32px', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', marginBottom: 24 }}>Proiect nou</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Titlu proiect *
                </label>
                <input type="text" placeholder="Ex: Living cozy 2026"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--card-border)', fontSize: '1rem', background: 'var(--cream)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Notițe (opțional)
                </label>
                <textarea placeholder="Stil, buget, obiective, deadline..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--card-border)', fontSize: '1rem', background: 'var(--cream)', outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                Creează proiect →
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {projects.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Nu ai niciun proiect încă.
            </p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Creează primul proiect →
            </button>
          </div>
        )}

        {/* Projects list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {projects.map(project => {
            const isOpen = expanded[project.id];
            const doneTasks  = (project.tasks || []).filter(t => t.completed).length;
            const totalTasks = (project.tasks || []).length;
            const progress   = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const tab        = getTab(project.id);

            return (
              <div key={project.id} style={{ background: 'var(--white)', border: '1px solid var(--card-border)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => setExpanded(p => ({ ...p, [project.id]: !p[project.id] }))}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.3rem', marginBottom: project.description ? 4 : 8 }}>
                      {project.title}
                    </h3>
                    {project.description && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.83rem', color: 'var(--text-muted)', fontWeight: 300, marginBottom: 10 }}>
                        {project.description}
                      </p>
                    )}
                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {totalTasks > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 80, height: 4, background: 'var(--cream-dark)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#6b9e78' : 'var(--brown)', transition: 'width 0.4s' }} />
                          </div>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {doneTasks}/{totalTasks} taskuri
                          </span>
                        </div>
                      )}
                      {(project.inspirations?.length > 0) && (
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {project.inspirations.length} inspirații
                        </span>
                      )}
                      {(project.moodboards?.length > 0) && (
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {project.moodboards.length} moodboards
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {/* Delete */}
                    {deleteConf === project.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sigur ștergi?</span>
                        <button onClick={() => handleDeleteProject(project.id)} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer' }}>Da</button>
                        <button onClick={() => setDeleteConf(null)} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', padding: '4px 10px', background: 'transparent', border: '1px solid var(--card-border)', cursor: 'pointer' }}>Nu</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConf(project.id)}
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                        Șterge
                      </button>
                    )}
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', cursor: 'pointer', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                      onClick={() => setExpanded(p => ({ ...p, [project.id]: !p[project.id] }))}>▾</span>
                  </div>
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--card-border)' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)' }}>
                      {[
                        { key: 'tasks',        label: `Taskuri${totalTasks > 0 ? ` (${doneTasks}/${totalTasks})` : ''}` },
                        { key: 'inspirations', label: `Inspirații${project.inspirations?.length > 0 ? ` (${project.inspirations.length})` : ''}` },
                        { key: 'moodboards',   label: `Moodboards${project.moodboards?.length > 0 ? ` (${project.moodboards.length})` : ''}` },
                      ].map(t => (
                        <button key={t.key} onClick={() => setActiveTab(p => ({ ...p, [project.id]: t.key }))}
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: tab === t.key ? 600 : 300, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.key ? 'var(--text)' : 'transparent'}`, cursor: 'pointer', color: tab === t.key ? 'var(--text)' : 'var(--text-muted)' }}>
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding: '24px 28px' }}>

                      {/* TASKS tab */}
                      {tab === 'tasks' && (
                        <div>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <input type="text" placeholder="Adaugă un task sau notă..."
                              value={taskInputs[project.id] || ''}
                              onChange={e => setTaskInputs(p => ({ ...p, [project.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && handleCreateTask(project.id)}
                              style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--card-border)', fontSize: '0.9rem', background: 'var(--cream)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                            />
                            <button className="btn btn-primary btn-sm" onClick={() => handleCreateTask(project.id)}>
                              Adaugă
                            </button>
                          </div>
                          {project.tasks?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {project.tasks.map(task => (
                                <label key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 12px', background: task.completed ? 'var(--cream-dark)' : 'var(--white)', border: '1px solid var(--card-border)' }}>
                                  <input type="checkbox" checked={task.completed}
                                    onChange={() => handleToggleTask(task.id, project.id)}
                                    style={{ accentColor: 'var(--text)', width: 15, height: 15 }}
                                  />
                                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.45 : 1, fontWeight: 300 }}>
                                    {task.text}
                                  </span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                              Niciun task încă. Adaugă idei, obiective sau lucruri de cumpărat.
                            </p>
                          )}
                        </div>
                      )}

                      {/* INSPIRATIONS tab */}
                      {tab === 'inspirations' && (
                        <div>
                          {/* Upload */}
                          <div style={{ border: '1px dashed var(--card-border)', padding: '20px', marginBottom: 20, background: 'var(--cream-dark)' }}>
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                              Adaugă imagine de inspirație
                            </p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', padding: '8px 16px', border: '1px solid var(--card-border)', background: 'var(--white)', cursor: 'pointer', color: 'var(--text)' }}>
                                Alege imagine
                                <input type="file" accept="image/*"
                                  ref={el => { if (el) fileRefs.current[project.id] = el; }}
                                  onChange={() => {}} style={{ display: 'none' }}
                                />
                              </label>
                              <input type="text" placeholder="Descriere (opțional)"
                                value={inspCaption[project.id] || ''}
                                onChange={e => setInspCaption(p => ({ ...p, [project.id]: e.target.value }))}
                                style={{ flex: 1, minWidth: 180, padding: '8px 12px', border: '1px solid var(--card-border)', fontSize: '0.85rem', background: 'var(--white)', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                              />
                              <button className="btn btn-primary btn-sm" onClick={() => handleUploadInsp(project.id)}>
                                Upload
                              </button>
                            </div>
                          </div>

                          {/* Grid */}
                          {project.inspirations?.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
                              {project.inspirations.map(item => (
                                <div key={item.id} style={{ overflow: 'hidden' }}>
                                  <img src={imgUrl(item.imageUrl)} alt={item.caption || 'Inspirație'}
                                    style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                                  />
                                  {item.caption && (
                                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'var(--text-muted)', padding: '5px 2px', fontWeight: 300 }}>
                                      {item.caption}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 300 }}>
                              Nicio inspirație adăugată. Încarcă poze din reviste, Pinterest sau alte surse.
                            </p>
                          )}
                        </div>
                      )}

                      {/* MOODBOARDS tab */}
                      {tab === 'moodboards' && (
                        <div>
                          {project.moodboards?.length > 0 ? (
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                              {project.moodboards.map(board => (
                                <Link key={board.id} to={`/moodboards/${board.id}`}
                                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', padding: '8px 16px', border: '1px solid var(--card-border)', background: 'var(--cream-dark)', color: 'var(--text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {board.title}
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{board.items?.length || 0} imagini</span>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 300, marginBottom: 16 }}>
                              Niciun moodboard asociat proiectului.
                            </p>
                          )}
                          <Link to={`/moodboards?projectId=${project.id}`} className="btn btn-ghost btn-sm">
                            + Moodboard nou pentru proiect
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import usePersistentState from '../hooks/usePersistentState';

/* ── Color math ─────────────────────────────────────────────────────────── */
const hslToHex = (h, s, l) => {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const adjustHex = (hex, saturation = 0, lightness = 0) => {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, clamp(s + saturation, 5, 95), clamp(l + lightness, 5, 95));
};

const buildPalette = (hex, moodConfig = { saturation: 0, lightness: 0 }) => {
  const baseHex = adjustHex(hex, moodConfig.saturation, moodConfig.lightness);
  const [h, s, l] = hexToHsl(baseHex);
  return {
    base:           { hex: baseHex, role: 'Bază', desc: 'Culoarea principală' },
    lighter:        { hex: hslToHex(h, s, Math.min(l + 20, 95)), role: 'Nuanță deschisă', desc: 'Pereți, textile' },
    darker:         { hex: hslToHex(h, s, Math.max(l - 20, 5)),  role: 'Nuanță închisă', desc: 'Mobilier, cadre' },
    complementary:  { hex: hslToHex((h + 180) % 360, s, l),       role: 'Complementar', desc: 'Accent decorativ' },
    analogous1:     { hex: hslToHex((h + 30)  % 360, s, l),       role: 'Analog 1', desc: 'Textile secundare' },
    analogous2:     { hex: hslToHex((h - 30 + 360) % 360, s, l),  role: 'Analog 2', desc: 'Ceramică, vaze' },
    neutral:        { hex: hslToHex(h, Math.max(s - 40, 5), Math.min(l + 30, 95)), role: 'Neutru', desc: 'Fundal, spațiu alb' },
  };
};

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const ROOM_PRESETS = [
  {
    label: 'Living clasic',
    hex: '#b8845c',
    roomType: 'living',
    mood: 'elegant',
    inspiration: [
      { src: unsplash('photo-1600210492486-724fe5c67fb0'), title: 'Living cu tonuri calde' },
      { src: unsplash('photo-1618221195710-dd6b41faaea6'), title: 'Mobilier clasic actual' },
      { src: unsplash('photo-1600607687920-4e2a09cf159d'), title: 'Accente elegante' },
    ],
  },
  {
    label: 'Dormitor romantic',
    hex: '#c8a4a4',
    roomType: 'bedroom',
    mood: 'calm',
    inspiration: [
      { src: unsplash('photo-1617325247661-675ab4b64ae2'), title: 'Textile roz pudrat' },
      { src: unsplash('photo-1616486338812-3dadae4b4ace'), title: 'Dormitor luminos' },
      { src: unsplash('photo-1600566753190-17f0baa2a6c3'), title: 'Nuanțe moi și calme' },
    ],
  },
  {
    label: 'Bucătărie nordică',
    hex: '#8fa89a',
    roomType: 'kitchen',
    mood: 'natural',
    inspiration: [
      { src: unsplash('photo-1556911220-bff31c812dba'), title: 'Verde salvie și lemn' },
      { src: unsplash('photo-1600489000022-c2086d79f9d4'), title: 'Bucătărie luminoasă' },
      { src: unsplash('photo-1556909114-f6e7ad7d3136'), title: 'Accente nordice' },
    ],
  },
  {
    label: 'Birou boem',
    hex: '#a08060',
    roomType: 'office',
    mood: 'warm',
    inspiration: [
      { src: unsplash('photo-1518455027359-f3f8164ba6bd'), title: 'Birou cu lemn cald' },
      { src: unsplash('photo-1486946255434-2466348c2166'), title: 'Detalii boeme' },
      { src: unsplash('photo-1524758631624-e2822e304c36'), title: 'Spațiu de lucru texturat' },
    ],
  },
  {
    label: 'Baie minimalistă',
    hex: '#9db2c0',
    roomType: 'bathroom',
    mood: 'calm',
    inspiration: [
      { src: unsplash('photo-1620626011761-996317b8d101'), title: 'Albastru gri curat' },
      { src: unsplash('photo-1584622650111-993a426fbf0a'), title: 'Baie luminoasă' },
      { src: unsplash('photo-1600566752355-35792bedcfea'), title: 'Finisaje minimaliste' },
    ],
  },
  {
    label: 'Sufragerie japandi',
    hex: '#c4b89a',
    roomType: 'living',
    mood: 'natural',
    inspiration: [
      { src: unsplash('photo-1600121848594-d8644e57abab'), title: 'Bej, lemn și liniște' },
      { src: unsplash('photo-1600210491369-e753d80a41f3'), title: 'Forme simple' },
      { src: unsplash('photo-1617806118233-18e1de247200'), title: 'Naturalețe japandi' },
    ],
  },
];

const ROOM_TYPES = {
  living: {
    label: 'Living',
    advice: 'Pentru living se recomandă o paletă echilibrată, cu o culoare neutră dominantă și accente moderate.',
    dominantUse: 'Pereți, canapea mare, covor',
    secondaryUse: 'Fotolii, draperii, mobilier auxiliar',
    accentUse: 'Perne, tablouri, vaze, corpuri de iluminat',
  },
  bedroom: {
    label: 'Dormitor',
    advice: 'Pentru dormitor sunt potrivite nuanțele calme, mai puțin saturate, care susțin relaxarea.',
    dominantUse: 'Pereți, lenjerie, textile mari',
    secondaryUse: 'Tăblie pat, noptiere, covor',
    accentUse: 'Perne decorative, veioze, rame',
  },
  kitchen: {
    label: 'Bucătărie',
    advice: 'Pentru bucătărie funcționează bine paletele luminoase, ușor de combinat cu lemn, piatră sau metal.',
    dominantUse: 'Fronturi, pereți, blat deschis',
    secondaryUse: 'Scaune, rafturi, textile',
    accentUse: 'Accesorii, veselă, plante',
  },
  bathroom: {
    label: 'Baie',
    advice: 'Pentru baie sunt recomandate nuanțele curate, luminoase, cu accente discrete.',
    dominantUse: 'Faianță, pereți, pardoseală',
    secondaryUse: 'Mobilier baie, prosoape',
    accentUse: 'Accesorii, rame, plante',
  },
  office: {
    label: 'Birou',
    advice: 'Pentru birou sunt potrivite culorile clare, care nu obosesc vizual și susțin concentrarea.',
    dominantUse: 'Pereți, bibliotecă, birou',
    secondaryUse: 'Scaun, covor, perdele',
    accentUse: 'Lampă, organizatoare, decorațiuni',
  },
};

const MOODS = {
  calm: { label: 'Calm', saturation: -20, lightness: 10, material: 'Lemn deschis, ceramică mată, textile naturale' },
  warm: { label: 'Cald', saturation: 5, lightness: 5, material: 'Lemn natur, alamă antichizată, ratan' },
  elegant: { label: 'Elegant', saturation: -10, lightness: -8, material: 'Auriu discret, negru mat, marmură sau sticlă fumurie' },
  energetic: { label: 'Energic', saturation: 15, lightness: 0, material: 'Metal colorat, lemn mediu, accente lucioase' },
  natural: { label: 'Natural', saturation: -15, lightness: 8, material: 'Lemn deschis, piatră, in, bambus' },
};

const EXTRACTION_VERSION = 2;

const rgbToHex = (r, g, b) =>
  `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`;

const rgbToHslValues = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hexDistance = (left, right) => {
  const parse = (hex) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [lr, lg, lb] = parse(left);
  const [rr, rg, rb] = parse(right);
  return Math.hypot(lr - rr, lg - rg, lb - rb);
};

const readFileDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const extractImageColors = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 180;
      const ratio = Math.min(size / image.width, size / image.height, 1);
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const buckets = new Map();

      for (let index = 0; index < data.length; index += 8) {
        const alpha = data[index + 3];
        if (alpha < 180) continue;

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;
        if (brightness < 18 || brightness > 248) continue;

        const [h, s, l] = rgbToHslValues(r, g, b);
        if (s < 6 && (l < 18 || l > 88)) continue;

        const key = [
          Math.round(h / 12) * 12,
          Math.round(s / 12) * 12,
          Math.round(l / 10) * 10,
        ].join('-');
        const current = buckets.get(key) || { r: 0, g: 0, b: 0, h: 0, s: 0, l: 0, count: 0 };
        buckets.set(key, {
          r: current.r + r,
          g: current.g + g,
          b: current.b + b,
          h: current.h + h,
          s: current.s + s,
          l: current.l + l,
          count: current.count + 1,
        });
      }

      const candidates = [...buckets.values()]
        .map(item => {
          const r = Math.round(item.r / item.count);
          const g = Math.round(item.g / item.count);
          const b = Math.round(item.b / item.count);
          const h = item.h / item.count;
          const s = item.s / item.count;
          const l = item.l / item.count;
          const saturationBoost = s / 100;
          const accentBoost = s > 38 && l > 20 && l < 86 ? 34 * Math.sqrt(item.count) * saturationBoost : 0;

          return {
            hex: rgbToHex(r, g, b),
            hueGroup: Math.round(h / 30) * 30,
            count: item.count,
            score: item.count * (0.55 + saturationBoost) + accentBoost,
            accentScore: item.count * saturationBoost + accentBoost,
          };
        });

      const hueAccents = new Map();
      candidates
        .filter(item => item.accentScore > 0)
        .forEach(item => {
          const current = hueAccents.get(item.hueGroup);
          if (!current || item.accentScore > current.accentScore) hueAccents.set(item.hueGroup, item);
        });

      const ranked = [
        ...candidates.sort((a, b) => b.score - a.score),
        ...[...hueAccents.values()].sort((a, b) => b.accentScore - a.accentScore),
      ];

      const colors = [];
      ranked.forEach(item => {
        if (colors.length >= 8) return;
        if (colors.every(hex => hexDistance(hex, item.hex) > 42)) colors.push(item.hex);
      });

      resolve(colors.slice(0, 6));
    };

    image.onerror = reject;

    if (typeof source === 'string') {
      image.src = source;
    } else {
      readFileDataUrl(source).then((dataUrl) => {
        image.src = dataUrl;
      }).catch(reject);
    }
  });

export default function PalettePage() {
  const [color,   setColor]   = usePersistentState('nestify:palette:color', '#b8845c');
  const [copied,  setCopied]  = useState('');
  const [roomType, setRoomType] = usePersistentState('nestify:palette:roomType', 'living');
  const [mood, setMood] = usePersistentState('nestify:palette:mood', 'calm');
  const [selectedPresetLabel, setSelectedPresetLabel] = usePersistentState('nestify:palette:selectedPresetLabel', 'Living clasic');
  const [imagePreview, setImagePreview] = usePersistentState('nestify:palette:imagePreview', '');
  const [imageColors, setImageColors] = usePersistentState('nestify:palette:imageColors', []);
  const [imageError, setImageError] = usePersistentState('nestify:palette:imageError', '');
  const [extractionVersion, setExtractionVersion] = usePersistentState('nestify:palette:extractionVersion', 0);

  const roomInfo = ROOM_TYPES[roomType];
  const moodInfo = MOODS[mood];
  const palette = buildPalette(color, moodInfo);
  const selectedPreset = ROOM_PRESETS.find(preset => preset.label === selectedPresetLabel);
  const inspirationSwatches = [palette.neutral, palette.lighter, palette.base, palette.complementary];
  const colorPlan = [
    {
      percent: '60%',
      title: 'Culoare dominantă',
      hex: palette.neutral.hex,
      use: roomInfo.dominantUse,
      recommendation: 'Pereți',
    },
    {
      percent: '30%',
      title: 'Culoare secundară',
      hex: palette.lighter.hex,
      use: roomInfo.secondaryUse,
      recommendation: 'Mobilier principal',
    },
    {
      percent: '10%',
      title: 'Accent decorativ',
      hex: palette.complementary.hex,
      use: roomInfo.accentUse,
      recommendation: 'Textile și accente',
    },
  ];

  useEffect(() => {
    if (!imagePreview || extractionVersion === EXTRACTION_VERSION) return;

    let cancelled = false;
    extractImageColors(imagePreview)
      .then(colors => {
        if (cancelled) return;
        setImageColors(colors);
        if (colors[0]) setColor(colors[0]);
        setExtractionVersion(EXTRACTION_VERSION);
      })
      .catch(() => {
        if (!cancelled) setExtractionVersion(EXTRACTION_VERSION);
      });

    return () => {
      cancelled = true;
    };
  }, [extractionVersion, imagePreview, setColor, setExtractionVersion, setImageColors]);

  const copyHex = async (hex) => {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(''), 2000);
  };

  const handlePresetClick = (preset) => {
    setColor(preset.hex);
    setRoomType(preset.roomType);
    setMood(preset.mood);
    setSelectedPresetLabel(preset.label);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Alege un fișier imagine.');
      return;
    }

    setImageError('');
    setSelectedPresetLabel('');

    try {
      const preview = await readFileDataUrl(file);
      const colors = await extractImageColors(file);
      setImagePreview(preview);
      setImageColors(colors);
      setExtractionVersion(EXTRACTION_VERSION);
      if (colors[0]) setColor(colors[0]);
      if (!colors.length) setImageError('Nu am putut extrage culori clare din imagine.');
    } catch (error) {
      console.error(error);
      setImageColors([]);
      setImageError('Nu am putut analiza imaginea. Încearcă o altă poză.');
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setImageColors([]);
    setImageError('');
    setExtractionVersion(0);
  };

  return (
    <div className="museum-home">
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ padding: '60px 48px 48px', background: 'var(--cream-dark)' }}>
        <span className="museum-kicker">Unealtă de design</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 10 }}>
          Generator de paletă
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 560, lineHeight: 1.8 }}>
          Alege o culoare de bază și primești o paletă completă armonioasă pentru camera ta — culori complementare, analoge și neutre.
        </p>
      </div>

      <main style={{ padding: '48px 48px 100px', maxWidth: 960, margin: '0 auto' }}>

        {/* Color picker + presets */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 48 }}>
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 12 }}>
              Culoarea ta de bază
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <input
                type="color"
                value={color}
                onChange={e => {
                  setColor(e.target.value);
                  setSelectedPresetLabel('');
                }}
                style={{ width: 72, height: 72, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', padding: 0, background: 'none' }}
              />
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{color.toUpperCase()}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Apasă pentru a schimba culoarea</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 12 }}>
              Sugestii rapide
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROOM_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => handlePresetClick(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${selectedPresetLabel === p.label ? 'var(--accent)' : 'var(--card-border)'}`, background: selectedPresetLabel === p.label ? 'var(--cream-dark)' : 'var(--white)', cursor: 'pointer', fontSize: '0.82rem' }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: p.hex, display: 'inline-block', flexShrink: 0 }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedPreset?.inspiration?.length > 0 && (
          <section style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '24px 26px', marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 8 }}>
                  Inspirație pentru sugestia aleasă
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.45rem', marginBottom: 6 }}>
                  {selectedPreset.label}
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.65, fontSize: '0.9rem' }}>
                  Imagini orientative care folosesc aceeași direcție cromatică și atmosferă.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {inspirationSwatches.map(swatch => (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => copyHex(swatch.hex)}
                    title={`Copiază ${swatch.hex.toUpperCase()}`}
                    style={{ width: 34, height: 34, background: swatch.hex, border: '1px solid var(--card-border)', borderRadius: 99, cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {selectedPreset.inspiration.map((image, index) => (
                <figure key={image.src} style={{ position: 'relative', minHeight: index === 0 ? 260 : 220, margin: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', background: 'var(--cream-dark)', border: '1px solid var(--card-border)' }}>
                  <img
                    src={image.src}
                    alt={image.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
                  />
                  <figcaption style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '34px 14px 14px', color: '#fff', background: 'linear-gradient(to top, rgba(26,20,16,0.72), rgba(26,20,16,0))', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 500 }}>
                    {image.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Image upload */}
        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 24, alignItems: 'stretch', background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '24px 26px', marginBottom: 40 }}>
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 10 }}>
              Inspiră paleta dintr-o poză
            </p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.45rem', marginBottom: 8 }}>
              Încarcă o imagine de interior
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 18 }}>
              Poți folosi o fotografie cu o cameră, o textură, un material sau un moodboard. Generatorul extrage culori dominante și le poți transforma instant în paleta de bază.
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: imageColors.length ? 18 : 0 }}>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                Alege poză
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              {imagePreview && (
                <button type="button" className="btn btn-ghost" onClick={clearImage}>
                  Șterge poza
                </button>
              )}
            </div>

            {imageError && (
              <p style={{ fontSize: '0.82rem', color: '#a33', marginTop: 12 }}>
                {imageError}
              </p>
            )}

            {imageColors.length > 0 && (
              <div>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 10 }}>
                  Culori extrase
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {imageColors.map(hex => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        setColor(hex);
                        setSelectedPresetLabel('');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: `1.5px solid ${color === hex ? 'var(--accent)' : 'var(--card-border)'}`, background: color === hex ? 'var(--cream-dark)' : 'var(--white)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem' }}
                    >
                      <span style={{ width: 18, height: 18, background: hex, border: '1px solid rgba(0,0,0,0.08)', display: 'inline-block' }} />
                      {hex.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ minHeight: 220, background: 'var(--cream-dark)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {imagePreview ? (
              <img src={imagePreview} alt="Imagine pentru paletă" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.25rem', color: 'var(--text)', marginBottom: 8 }}>
                  Preview imagine
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Aici va apărea fotografia încărcată.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Room + atmosphere */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 8 }}>
              Tip cameră
            </label>
            <select
              value={roomType}
              onChange={e => {
                setRoomType(e.target.value);
                setSelectedPresetLabel('');
              }}
              className="style-filter-select"
              style={{ width: '100%' }}
            >
              {Object.entries(ROOM_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-light)', marginBottom: 8 }}>
              Atmosferă dorită
            </label>
            <select
              value={mood}
              onChange={e => {
                setMood(e.target.value);
                setSelectedPresetLabel('');
              }}
              className="style-filter-select"
              style={{ width: '100%' }}
            >
              {Object.entries(MOODS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview strip */}
        <div style={{ display: 'flex', height: 80, borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 32, boxShadow: 'var(--shadow-md)' }}>
          {Object.values(palette).map(swatch => (
            <div key={swatch.hex} style={{ flex: 1, background: swatch.hex }} />
          ))}
        </div>

        {/* Palette cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {Object.values(palette).map(swatch => (
            <div
              key={swatch.hex}
              onClick={() => copyHex(swatch.hex)}
              style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.15s' }}
            >
              <div style={{ height: 120, background: swatch.hex }} />
              <div style={{ padding: '14px 16px', background: 'var(--white)' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 4 }}>
                  {copied === swatch.hex ? '✓ Copiat!' : swatch.hex.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>{swatch.role}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{swatch.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 60-30-10 plan */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-lg)', padding: '28px 32px', marginBottom: 32 }}>
          <span className="museum-kicker">Regula 60-30-10</span>
          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.35rem', marginBottom: 10 }}>
            Recomandare pentru {roomInfo.label.toLowerCase()} · atmosferă {moodInfo.label.toLowerCase()}
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: 22 }}>
            {roomInfo.advice}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 22 }}>
            {colorPlan.map(item => (
              <div key={item.title} style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--cream)' }}>
                <div style={{ height: 76, background: item.hex }} />
                <div style={{ padding: 14 }}>
                  <p style={{ fontWeight: 700, marginBottom: 4 }}>{item.percent} · {item.title}</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: 6 }}>{item.hex.toUpperCase()}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--brown)', fontWeight: 700, marginBottom: 4 }}>{item.recommendation}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.use}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, background: 'var(--cream-dark)', padding: 16, borderRadius: 'var(--radius-md)' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 4 }}>Accente decorative</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{palette.complementary.hex.toUpperCase()} și {palette.analogous1.hex.toUpperCase()}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-light)', marginBottom: 4 }}>Metal / lemn recomandat</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{moodInfo.material}</p>
            </div>
          </div>
        </div>

        {/* How to use */}
        <div style={{ background: 'var(--cream-dark)', borderRadius: 'var(--radius-lg)', padding: '28px 32px' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', marginBottom: 16 }}>Cum să folosești paleta</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'Pereți', color: { hex: colorPlan[0].hex }, desc: `${colorPlan[0].percent} din cameră: ${colorPlan[0].use}.` },
              { label: 'Mobilier principal', color: { hex: colorPlan[1].hex }, desc: `${colorPlan[1].percent} din cameră: ${colorPlan[1].use}.` },
              { label: 'Textile', color: { hex: palette.analogous1.hex }, desc: 'Leagă vizual dominantul și accentul fără să aglomereze camera.' },
              { label: 'Accente decorative', color: { hex: colorPlan[2].hex }, desc: `${colorPlan[2].percent} din cameră: ${colorPlan[2].use}.` },
            ].map(tip => (
              <div key={tip.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: tip.color.hex, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>{tip.label}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
          <Link to="/quiz" className="btn btn-primary">Descoperă stilul tău →</Link>
          <Link to="/assistant" className="btn btn-ghost">AI Design Assistant</Link>
        </div>
      </main>
    </div>
  );
}


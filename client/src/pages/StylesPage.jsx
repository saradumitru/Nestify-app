import { useEffect, useState } from 'react';
import api from '../services/api';
import StyleCard from '../components/StyleCard';

function StylesPage() {
  const [styles, setStyles] = useState([]);

  useEffect(() => {
    const fetchStyles = async () => {
      const res = await api.get('/styles');
      setStyles(res.data);
    };

    fetchStyles();
  }, []);

  return (
    <div className="min-h-screen px-6 md:px-20 py-16">

      {/* HEADER */}
      <div className="mb-20">
        <h1 className="text-6xl font-serif leading-tight">
          Nestify
        </h1>
        <p className="text-gray-600 mt-2">
          Explore interior styles & curated spaces
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-10">
        {styles.map(style => (
          <StyleCard key={style.id} style={style} />
        ))}
      </div>
    </div>
  );
}

export default StylesPage;
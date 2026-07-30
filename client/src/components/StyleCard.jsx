import { useNavigate } from 'react-router-dom';

function StyleCard({ style }) {
  const navigate = useNavigate();
  const imageUrl = style.imageUrl || style.images?.[0]?.imageUrl;

  return (
    <div onClick={() => navigate(`/styles/${style.slug}`)} className="group relative cursor-pointer">
      <div className="overflow-hidden rounded-[2rem] shadow-xl">
        <img
          src={imageUrl}
          alt={style.title || style.name}
          className="w-full h-[320px] md:h-[380px] object-cover transition duration-700 group-hover:scale-110"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-[2rem]"></div>

      <div className="absolute bottom-0 p-7 text-white">
        <p className="uppercase tracking-[0.25em] text-xs opacity-70 mb-2">Interior style</p>
        <h2 className="text-3xl md:text-4xl font-serif leading-tight">{style.title || style.name}</h2>
        <p className="text-sm opacity-85 mt-2 max-w-md">{style.description || style.kicker || 'Stil interior rafinat.'}</p>
      </div>
    </div>
  );
}

export default StyleCard;

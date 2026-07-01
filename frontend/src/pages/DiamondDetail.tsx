import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Diamond as DiamondIcon, ShieldAlert, Play, Image as ImageIcon, ExternalLink } from 'lucide-react';

interface Section {
  _id: string;
  name: string;
  order: number;
}

interface Field {
  _id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'image' | 'video' | 'link';
  section: string;
  order: number;
}

interface Diamond {
  _id: string;
  name: string;
  images: string[];
  dynamicData: Record<string, any>;
  createdAt: string;
}

export const DiamondDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [diamond, setDiamond] = useState<Diamond | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchDiamondDetails();
  }, [id]);

  const fetchDiamondDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [diamondRes, secRes, fieldRes] = await Promise.all([
        api.get(`/api/diamonds/${id}`),
        api.get('/api/sections'),
        api.get('/api/fields'),
      ]);
      setDiamond(diamondRes.data);
      setSections(secRes.data);
      setFields(fieldRes.data);
    } catch (err: any) {
      setError(
        err.response?.status === 404
          ? 'Diamond record not found.'
          : 'Failed to retrieve diamond specifications.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto" />
        <p className="text-slate-400 mt-4">Loading diamond specifications...</p>
      </div>
    );
  }

  if (error || !diamond) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="glass-card rounded-2xl p-8 border border-red-950/30 flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-red-400 mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Retrieval Error</h2>
          <p className="text-slate-400 mb-6">{error || 'Diamond not loaded.'}</p>
          <Link
            to="/"
            className="flex items-center space-x-1 bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  // Collect the primary diamond_video and diamond_image values from dynamic data
  const primaryVideo = diamond.dynamicData?.['diamond_video'] || '';
  const primaryImage = diamond.dynamicData?.['diamond_image'] || '';

  // All non-media fields for the specs table (exclude diamond_video / diamond_image from the right panel)
  const MEDIA_FIELD_NAMES = new Set(['diamond_video', 'diamond_image']);

  // Collect all image URLs for the strip (from images array + primaryImage if it exists)
  const imageStrip: string[] = [
    ...(primaryImage ? [primaryImage] : []),
    ...(diamond.images || []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back nav */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back to Catalog</span>
        </button>
      </div>

      {/* Title row */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{diamond.name}</h1>
        <p className="text-xs text-slate-500 font-mono mt-1">Ref ID: {diamond._id}</p>
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ─── LEFT PANEL: Video + Image strip ─── */}
        <div className="space-y-4">

          {/* Primary Video Player */}
          {primaryVideo ? (
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-slate-950/60 relative">
              <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">360° View</span>
              </div>
              <video
                src={primaryVideo}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-[4/3] object-cover bg-black"
              />
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/5 bg-slate-950/40 aspect-[4/3] flex flex-col items-center justify-center text-slate-600">
              <Play className="w-14 h-14 text-slate-700/50 stroke-[1] mb-2" />
              <span className="text-xs text-slate-500 font-medium">No video uploaded</span>
            </div>
          )}

          {/* Image Strip / Gallery */}
          {imageStrip.length > 0 ? (
            <div className="space-y-3">
              {/* Large active image preview */}
              <div className="glass-card rounded-xl overflow-hidden border border-white/5 bg-slate-950/40 aspect-[4/3] relative">
                <img
                  src={imageStrip[activeImageIndex]}
                  alt={diamond.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white font-semibold border border-white/10">
                  <ImageIcon className="w-3 h-3 inline mr-1" />
                  {activeImageIndex + 1} / {imageStrip.length}
                </div>
              </div>

              {/* Thumbnails */}
              {imageStrip.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {imageStrip.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`rounded-lg overflow-hidden border aspect-square transition-all ${
                        activeImageIndex === index
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30 opacity-100'
                          : 'border-white/10 opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            !primaryVideo && (
              <div className="glass-card rounded-xl border border-white/5 bg-slate-950/40 aspect-[4/3] flex flex-col items-center justify-center text-slate-600">
                <DiamondIcon className="w-14 h-14 text-slate-700/50 stroke-[1] mb-2" />
                <span className="text-xs text-slate-500">No images uploaded</span>
              </div>
            )
          )}
        </div>

        {/* ─── RIGHT PANEL: Specs table ─── */}
        <div className="space-y-6">
          {sections.map((sec) => {
            const secFields = fields.filter((f) => f.section === sec._id);
            if (secFields.length === 0) return null;

            // Only show fields that have a value AND aren't the primary media fields (those are on the left)
            const visibleFields = secFields.filter((f) => {
              const val = diamond.dynamicData?.[f.name];
              const hasValue = val !== undefined && val !== null && val !== '';
              // Skip primary video and image — they're handled in left panel
              return hasValue && !MEDIA_FIELD_NAMES.has(f.name);
            });

            if (visibleFields.length === 0) return null;

            return (
              <div key={sec._id} className="glass-card rounded-xl border border-white/5 overflow-hidden">
                {/* Section header */}
                <div className="bg-slate-900/60 px-5 py-3 border-b border-white/5">
                  <h3 className="font-bold text-white text-sm uppercase tracking-widest">{sec.name}</h3>
                </div>

                {/* Table of specs */}
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-white/[0.04]">
                    {visibleFields.map((field) => {
                      const value = diamond.dynamicData?.[field.name];

                      return (
                        <tr key={field._id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 w-2/5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {field.label}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {field.type === 'image' && (
                              <a href={value} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={value}
                                  alt={field.label}
                                  className="h-14 w-14 object-cover rounded-lg border border-white/10 hover:border-indigo-500/50 transition-colors"
                                />
                              </a>
                            )}
                            {field.type === 'video' && (
                              <video src={value} controls className="w-48 rounded-lg border border-white/10 bg-slate-900" />
                            )}
                            {field.type === 'link' && (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 underline underline-offset-2 text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="break-all">{value}</span>
                              </a>
                            )}
                            {field.type === 'boolean' && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                value === true || value === 'true'
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/40'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                {value === true || value === 'true' ? 'Yes' : 'No'}
                              </span>
                            )}
                            {field.type !== 'image' && field.type !== 'video' && field.type !== 'link' && field.type !== 'boolean' && (
                              <span className="font-semibold text-white">{String(value)}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import {
  ArrowLeft, Save, Trash2, ShieldAlert,
  Video, Image as ImageIcon, Play, X, CheckCircle2, Sparkles
} from 'lucide-react';

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
  required: boolean;
  options: string[];
  section: string;
  order: number;
}

interface UploadState {
  [fieldName: string]: 'idle' | 'uploading' | 'done' | 'error';
}

export const DiamondForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [sections, setSections] = useState<Section[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [name, setName] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [dynamicData, setDynamicData] = useState<Record<string, any>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadStates, setUploadStates] = useState<UploadState>({});
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    fetchSchemaAndData();
  }, [id]);

  const fetchSchemaAndData = async () => {
    setLoading(true);
    setError('');
    try {
      const [secRes, fieldRes] = await Promise.all([
        api.get('/api/sections'),
        api.get('/api/fields'),
      ]);
      setSections(secRes.data);
      setFields(fieldRes.data);

      const defaults: Record<string, any> = {};
      fieldRes.data.forEach((f: Field) => {
        defaults[f.name] = f.type === 'boolean' ? false : '';
      });
      setDynamicData(defaults);

      if (isEditMode) {
        const diamondRes = await api.get(`/api/diamonds/${id}`);
        setName(diamondRes.data.name);
        setImages(diamondRes.data.images || []);
        setDynamicData((prev) => ({ ...prev, ...(diamondRes.data.dynamicData || {}) }));
      }
    } catch (err: any) {
      setError('Failed to fetch diamond data or schema.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setDynamicData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const setFieldUploadState = (fieldName: string, state: 'idle' | 'uploading' | 'done' | 'error') => {
    setUploadStates((prev) => ({ ...prev, [fieldName]: state }));
  };

  const handleFieldFileUpload = async (fieldName: string, file: File) => {
    setFieldUploadState(fieldName, 'uploading');
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleInputChange(fieldName, res.data.url);
      setFieldUploadState(fieldName, 'done');
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed.');
      setFieldUploadState(fieldName, 'error');
    }
  };

  const handleMainImageUpload = async (file: File) => {
    setMainImageUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [...prev, res.data.url]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setMainImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Diamond name is required.'); return; }
    for (const field of fields) {
      if (field.required) {
        const val = dynamicData[field.name];
        if (val === undefined || val === null || val === '') {
          setError(`"${field.label}" is required.`);
          return;
        }
      }
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = { name, images, dynamicData };
      if (isEditMode) {
        await api.put(`/api/diamonds/${id}`, payload);
      } else {
        await api.post('/api/diamonds', payload);
      }
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save diamond record.');
    } finally {
      setSubmitting(false);
    }
  };

  const videoFields = fields.filter((f) => f.type === 'video');
  const imageFields = fields.filter((f) => f.type === 'image');
  const nonMediaFields = fields.filter((f) => f.type !== 'video' && f.type !== 'image');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate('/admin')}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            {isEditMode ? 'Edit Diamond Details' : 'New Diamond Registration'}
          </h1>
          <p className="text-slate-400 mt-1 text-base">
            {isEditMode
              ? 'Modify specifications, video, and images.'
              : 'Fill in diamond specifications and upload media.'}
          </p>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-950/40 border border-red-800/60 rounded-xl p-4 text-red-200 text-base">
          <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-500 mx-auto" />
          <p className="text-slate-400 mt-5 text-base">Loading form layout…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* ── 2-column grid: left 3/5, right 2/5 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ════════════════════════════════════
                LEFT COLUMN  (3 / 5)
                1. Primary Identification (name)
                2. Video upload(s)
                3. Gallery Images
            ════════════════════════════════════ */}
            <div className="lg:col-span-3 space-y-7">

              {/* 1 — Primary Identification */}
              <div className="glass-card rounded-2xl p-7">
                <h2 className="section-heading flex items-center gap-2">
                  <span className="w-1.5 h-5 rounded-full bg-indigo-500 inline-block" />
                  Primary Identification
                </h2>
                <label className="field-label">
                  Diamond Name / Identifier <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 1.5ct Round Brilliant Ideal Cut"
                  className="glass-input w-full px-4 py-3 rounded-xl focus:outline-none text-base"
                />
              </div>

              {/* 2 — Video Upload(s) */}
              {videoFields.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-indigo-950/70 to-slate-900/80 px-7 py-5 border-b border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/25 rounded-xl border border-indigo-500/30">
                      <Video className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white leading-tight">Video Upload</p>
                      <p className="text-sm text-slate-400 mt-0.5">360° showcase or feature reel</p>
                    </div>
                  </div>

                  <div className="p-7 space-y-6">
                    {videoFields.map((field) => {
                      const value = dynamicData[field.name] || '';
                      const state = uploadStates[field.name] || 'idle';
                      return (
                        <div key={field._id}>
                          <label className="field-label flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </label>

                          {value ? (
                            <div className="relative rounded-xl overflow-hidden bg-black border border-white/10">
                              <video src={value} controls className="w-full aspect-video" />
                              <button
                                type="button"
                                onClick={() => { handleInputChange(field.name, ''); setFieldUploadState(field.name, 'idle'); }}
                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-800 backdrop-blur-sm transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {state === 'done' && (
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-950/90 backdrop-blur-sm border border-emerald-800 px-3 py-1.5 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs text-emerald-300 font-semibold">Uploaded</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <label
                              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all py-12 ${state === 'uploading'
                                ? 'border-indigo-500/60 bg-indigo-950/25 animate-pulse'
                                : 'border-white/10 bg-slate-900/30 hover:border-indigo-500/60 hover:bg-indigo-950/15'
                                }`}
                            >
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                required={field.required && !value}
                                disabled={state === 'uploading'}
                                onChange={(e) => { if (e.target.files?.[0]) handleFieldFileUpload(field.name, e.target.files[0]); }}
                              />
                              <div className={`p-4 rounded-2xl mb-4 border ${state === 'uploading'
                                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}>
                                {state === 'uploading' ? (
                                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-400 border-b-2" />
                                ) : (
                                  <Play className="w-8 h-8" />
                                )}
                              </div>
                              <p className="text-base font-semibold text-slate-200">
                                {state === 'uploading' ? 'Uploading video…' : 'Click to upload video'}
                              </p>
                              <p className="text-sm text-slate-500 mt-1.5">MP4, MOV, AVI, WEBM — max 50 MB</p>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3 — Dynamic Image Fields */}
              {imageFields.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-950/60 to-slate-900/80 px-7 py-5 border-b border-white/5 flex items-center gap-3">
                    <div className="p-2 bg-violet-600/20 rounded-xl border border-violet-500/30">
                      <ImageIcon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white leading-tight">Diamond Images</p>
                      <p className="text-sm text-slate-400 mt-0.5">Primary showcase photos</p>
                    </div>
                  </div>

                  <div className="p-7 space-y-6">
                    {imageFields.map((field) => {
                      const value = dynamicData[field.name] || '';
                      const state = uploadStates[field.name] || 'idle';
                      return (
                        <div key={field._id}>
                          <label className="field-label flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                          </label>

                          {value ? (
                            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                              <img src={value} alt={field.label} className="w-full aspect-square object-cover" />
                              <button
                                type="button"
                                onClick={() => { handleInputChange(field.name, ''); setFieldUploadState(field.name, 'idle'); }}
                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-950/90 hover:bg-red-900 text-red-300 border border-red-800 backdrop-blur-sm transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              {state === 'done' && (
                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-emerald-950/90 backdrop-blur-sm border border-emerald-800 px-3 py-1.5 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs text-emerald-300 font-semibold">Uploaded</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <label
                              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all py-12 ${state === 'uploading'
                                ? 'border-violet-500/60 bg-violet-950/20 animate-pulse'
                                : 'border-white/10 bg-slate-900/30 hover:border-violet-500/60 hover:bg-violet-950/10'
                                }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                required={field.required && !value}
                                disabled={state === 'uploading'}
                                onChange={(e) => { if (e.target.files?.[0]) handleFieldFileUpload(field.name, e.target.files[0]); }}
                              />
                              <div className={`p-4 rounded-2xl mb-4 border ${state === 'uploading'
                                ? 'bg-violet-600/20 border-violet-500/30 text-violet-400'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}>
                                {state === 'uploading' ? (
                                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-400 border-b-2" />
                                ) : (
                                  <ImageIcon className="w-8 h-8" />
                                )}
                              </div>
                              <p className="text-base font-semibold text-slate-200">
                                {state === 'uploading' ? 'Uploading image…' : 'Click to upload image'}
                              </p>
                              <p className="text-sm text-slate-500 mt-1.5">JPEG, PNG, WEBP — max 50 MB</p>
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4 — Gallery Images */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/80 px-7 py-5 border-b border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-slate-700/60 rounded-xl border border-slate-600/40">
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-tight">Gallery Images</p>
                    <p className="text-sm text-slate-400 mt-0.5">Multiple photos for the listing</p>
                  </div>
                </div>

                <div className="p-7">
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
                      {images.map((img, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-900 aspect-square">
                          <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button
                              type="button"
                              onClick={() => setImages((p) => p.filter((_, i) => i !== index))}
                              className="p-2 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <label
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleMainImageUpload(file);
                    }}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${isDraggingOver
                      ? 'border-indigo-500 bg-indigo-950/25 scale-[1.01]'
                      : 'border-white/10 bg-slate-900/30 hover:border-indigo-500/50 hover:bg-slate-900/50'
                      }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={mainImageUploading}
                      onChange={(e) => { if (e.target.files?.[0]) handleMainImageUpload(e.target.files[0]); }}
                    />
                    <div className="p-3.5 bg-slate-800 rounded-2xl text-indigo-400 mb-4 border border-slate-700">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="text-base font-semibold text-slate-200">
                      {mainImageUploading ? 'Uploading…' : 'Drop image here or click to browse'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1.5">JPEG, PNG, WEBP — max 50 MB</p>
                  </label>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════
                RIGHT COLUMN  (2 / 5)
                1. Dynamic spec sections
                2. Save / Cancel buttons (sticky)
            ════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-7">

              {/* Sticky Save / Cancel */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 sticky top-6 z-10 shadow-xl shadow-black/30">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-white px-6 py-3.5 rounded-xl text-base font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white border-b-2" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{submitting ? 'Saving…' : 'Save Diamond Record'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="w-full px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 text-base font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all"
                >
                  Cancel
                </button>
              </div>

              {/* Dynamic Sections (text / number / select / boolean / link) */}
              {sections.map((sec) => {
                const secFields = nonMediaFields.filter((f) => f.section === sec._id);
                if (secFields.length === 0) return null;
                return (
                  <div key={sec._id} className="glass-card rounded-2xl p-7">
                    <h2 className="section-heading flex items-center gap-2">
                      <span className="w-1.5 h-5 rounded-full bg-violet-500 inline-block" />
                      {sec.name}
                    </h2>
                    <div className="grid grid-cols-1 gap-5">
                      {secFields.map((field) => {
                        const value = dynamicData[field.name] !== undefined ? dynamicData[field.name] : '';
                        return (
                          <div key={field._id}>
                            <label className="field-label">
                              {field.label}{field.required && <span className="text-red-400 ml-1">*</span>}
                            </label>

                            {field.type === 'text' && (
                              <input
                                type="text"
                                required={field.required}
                                value={value}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl focus:outline-none text-base"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                            )}
                            {field.type === 'number' && (
                              <input
                                type="number"
                                step="any"
                                required={field.required}
                                value={value}
                                onChange={(e) => handleInputChange(field.name, e.target.value !== '' ? parseFloat(e.target.value) : '')}
                                className="glass-input w-full px-4 py-3 rounded-xl focus:outline-none text-base"
                                placeholder="e.g. 1.25"
                              />
                            )}
                            {field.type === 'select' && (
                              <select
                                required={field.required}
                                value={value}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl focus:outline-none text-base"
                              >
                                <option value="">— Select —</option>
                                {field.options?.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                            {field.type === 'boolean' && (
                              <div className="flex items-center gap-3 pt-1">
                                <input
                                  type="checkbox"
                                  id={field._id}
                                  checked={!!value}
                                  onChange={(e) => handleInputChange(field.name, e.target.checked)}
                                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 cursor-pointer"
                                />
                                <label htmlFor={field._id} className="text-base text-slate-300 cursor-pointer select-none">
                                  Yes / Active
                                </label>
                              </div>
                            )}
                            {field.type === 'link' && (
                              <input
                                type="url"
                                required={field.required}
                                value={value}
                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                className="glass-input w-full px-4 py-3 rounded-xl focus:outline-none text-base"
                                placeholder="https://example.com"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Edit, Trash2, Check, X, ShieldAlert, FolderPlus, FilePlus, Image, Video, Link2, Type, Hash, List, ToggleLeft } from 'lucide-react';

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

export const FormBuilder: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Section form state
  const [sectionName, setSectionName] = useState('');
  const [sectionOrder, setSectionOrder] = useState<number>(0);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editSectionName, setEditSectionName] = useState('');
  const [editSectionOrder, setEditSectionOrder] = useState<number>(0);

  // Field form state
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'select' | 'boolean' | 'image' | 'video' | 'link'>('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState(''); // Comma separated
  const [fieldSection, setFieldSection] = useState('');
  const [fieldOrder, setFieldOrder] = useState<number>(0);

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldLabel, setEditFieldLabel] = useState('');
  const [editFieldName, setEditFieldName] = useState('');
  const [editFieldType, setEditFieldType] = useState<'text' | 'number' | 'select' | 'boolean' | 'image' | 'video' | 'link'>('text');
  const [editFieldRequired, setEditFieldRequired] = useState(false);
  const [editFieldOptions, setEditFieldOptions] = useState('');
  const [editFieldSection, setEditFieldSection] = useState('');
  const [editFieldOrder, setEditFieldOrder] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [secRes, fieldRes] = await Promise.all([
        api.get('/api/sections'),
        api.get('/api/fields'),
      ]);
      setSections(secRes.data);
      setFields(fieldRes.data);

      if (secRes.data.length > 0 && !fieldSection) {
        setFieldSection(secRes.data[0]._id);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch sections and fields from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/api/sections', {
        name: sectionName,
        order: sectionOrder,
      });
      setSections([...sections, res.data].sort((a, b) => a.order - b.order));
      setSectionName('');
      setSectionOrder(0);
      setSuccess('Section created successfully!');

      if (sections.length === 0) {
        setFieldSection(res.data._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create section.');
    }
  };

  const handleUpdateSection = async (id: string) => {
    if (!editSectionName.trim()) return;
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/api/sections/${id}`, {
        name: editSectionName,
        order: editSectionOrder,
      });
      setSections(
        sections
          .map((s) => (s._id === id ? res.data : s))
          .sort((a, b) => a.order - b.order)
      );
      setEditingSectionId(null);
      setSuccess('Section updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update section.');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!window.confirm('Warning: Deleting a section will also delete all fields inside it. Continue?')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/sections/${id}`);
      setSections(sections.filter((s) => s._id !== id));
      setFields(fields.filter((f) => f.section !== id));
      setSuccess('Section and associated fields deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete section.');
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel.trim() || !fieldSection) return;
    setError('');
    setSuccess('');
    try {
      const optionsArr = fieldOptions
        .split(',')
        .map((opt) => opt.trim())
        .filter((opt) => opt !== '');

      const res = await api.post('/api/fields', {
        label: fieldLabel,
        name: fieldName || undefined,
        type: fieldType,
        required: fieldRequired,
        options: fieldType === 'select' ? optionsArr : [],
        section: fieldSection,
        order: fieldOrder,
      });

      setFields([...fields, res.data].sort((a, b) => a.order - b.order));
      setFieldLabel('');
      setFieldName('');
      setFieldOptions('');
      setFieldOrder(0);
      setFieldRequired(false);
      setSuccess('Field created successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create field.');
    }
  };

  const handleEditFieldClick = (f: Field) => {
    setEditingFieldId(f._id);
    setEditFieldLabel(f.label);
    setEditFieldName(f.name);
    setEditFieldType(f.type);
    setEditFieldRequired(f.required);
    setEditFieldOptions(f.options ? f.options.join(', ') : '');
    setEditFieldSection(f.section);
    setEditFieldOrder(f.order);
  };

  const handleUpdateField = async (id: string) => {
    if (!editFieldLabel.trim()) return;
    setError('');
    setSuccess('');
    try {
      const optionsArr = editFieldOptions
        .split(',')
        .map((opt) => opt.trim())
        .filter((opt) => opt !== '');

      const res = await api.put(`/api/fields/${id}`, {
        label: editFieldLabel,
        name: editFieldName || undefined,
        type: editFieldType,
        required: editFieldRequired,
        options: editFieldType === 'select' ? optionsArr : [],
        section: editFieldSection,
        order: editFieldOrder,
      });

      setFields(
        fields
          .map((f) => (f._id === id ? res.data : f))
          .sort((a, b) => a.order - b.order)
      );
      setEditingFieldId(null);
      setSuccess('Field updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update field.');
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!window.confirm('Delete this field? This will modify the dynamic schema.')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/fields/${id}`);
      setFields(fields.filter((f) => f._id !== id));
      setSuccess('Field deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete field.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dynamic Form Builder</h1>
          <p className="text-slate-400 mt-1">Configure layout sections and define schema fields for diamonds data entry.</p>
        </div>
        {success && (
          <div className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-indigo-950/30 border border-indigo-900/50 text-indigo-300 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-red-950/30 border border-red-900/50 text-red-300 text-sm flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading dynamic schema metadata...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SECTIONS MANAGEMENT PANEL (left) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <span>Create Section</span>
              </h2>
              <form onSubmit={handleAddSection} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Section Name</label>
                  <input
                    type="text"
                    required
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="e.g. Clarity & Measurements"
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Display Order</label>
                  <input
                    type="number"
                    value={sectionOrder}
                    onChange={(e) => setSectionOrder(parseInt(e.target.value) || 0)}
                    className="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </form>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Active Sections</h2>
              {sections.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No sections defined yet.</p>
              ) : (
                <div className="divide-y divide-white/5 space-y-3">
                  {sections.map((sec) => (
                    <div key={sec._id} className="pt-3 first:pt-0">
                      {editingSectionId === sec._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editSectionName}
                            onChange={(e) => setEditSectionName(e.target.value)}
                            className="glass-input w-full px-2 py-1.5 rounded text-sm text-white"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editSectionOrder}
                              onChange={(e) => setEditSectionOrder(parseInt(e.target.value) || 0)}
                              className="glass-input w-20 px-2 py-1 rounded text-sm text-white"
                              title="Section Order"
                            />
                            <button
                              onClick={() => handleUpdateSection(sec._id)}
                              className="p-1.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingSectionId(null)}
                              className="p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 text-xs bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded mr-2">
                              #{sec.order}
                            </span>
                            <span className="font-medium text-slate-200">{sec.name}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingSectionId(sec._id);
                                setEditSectionName(sec.name);
                                setEditSectionOrder(sec.order);
                              }}
                              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(sec._id)}
                              className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-950/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FIELDS CONFIGURATION PANEL (right) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Create Field Form */}
            {sections.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FilePlus className="w-5 h-5 text-indigo-400" />
                  <span>Define Field</span>
                </h2>
                <form onSubmit={handleAddField} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Field Label</label>
                    <input
                      type="text"
                      required
                      value={fieldLabel}
                      onChange={(e) => setFieldLabel(e.target.value)}
                      placeholder="e.g. Color Grade"
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Field Key / Name <span className="text-slate-500 font-normal">(Optional, generated from Label if empty)</span>
                    </label>
                    <input
                      type="text"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                      placeholder="e.g. color_grade"
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Target Section</label>
                    <select
                      value={fieldSection}
                      onChange={(e) => setFieldSection(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                    >
                      {sections.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Field Type</label>
                      <select
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value as any)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Dropdown Select</option>
                        <option value="boolean">Boolean Switch</option>
                        <option value="image">Image Upload</option>
                        <option value="video">Video Upload</option>
                        <option value="link">External Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Sort Order</label>
                      <input
                        type="number"
                        value={fieldOrder}
                        onChange={(e) => setFieldOrder(parseInt(e.target.value) || 0)}
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  {fieldType === 'select' && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Dropdown Options <span className="text-slate-500 font-normal">(Comma-separated)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fieldOptions}
                        onChange={(e) => setFieldOptions(e.target.value)}
                        placeholder="e.g. D, E, F, G, H, I"
                        className="glass-input w-full px-3 py-2 rounded-lg text-sm placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  )}

                  {fieldType === 'image' && (
                    <div className="md:col-span-2 flex items-start space-x-2 bg-violet-950/20 border border-violet-900/30 rounded-lg px-3 py-2">
                      <Image className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-violet-300">
                        When filling the diamond form, users will see a <strong>file picker</strong> to upload an image. The uploaded URL is stored automatically via Multer.
                      </p>
                    </div>
                  )}

                  {fieldType === 'video' && (
                    <div className="md:col-span-2 flex items-start space-x-2 bg-blue-950/20 border border-blue-900/30 rounded-lg px-3 py-2">
                      <Video className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-300">
                        When filling the diamond form, users will see a <strong>video file picker</strong>. Videos up to 50 MB are accepted and stored via Multer. A preview player is shown inline.
                      </p>
                    </div>
                  )}

                  {fieldType === 'link' && (
                    <div className="md:col-span-2 flex items-start space-x-2 bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-3 py-2">
                      <Link2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-emerald-300">
                        Users enter a full <strong>URL (https://...)</strong> — e.g. a certificate link or external resource. It renders as a clickable link on the public detail page.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="required"
                      checked={fieldRequired}
                      onChange={(e) => setFieldRequired(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <label htmlFor="required" className="text-sm text-slate-300 cursor-pointer select-none">
                      Mark as Required Field
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Form Field</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Fields List grouped by Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Dynamic Form Schema Preview</h2>
              {sections.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center text-slate-500 italic">
                  Create a section first to start adding fields.
                </div>
              ) : (
                sections.map((sec) => {
                  const secFields = fields.filter((f) => f.section === sec._id);
                  return (
                    <div key={sec._id} className="glass-card rounded-xl p-6 border border-white/5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-4">
                        <h3 className="font-bold text-white text-md flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span>{sec.name}</span>
                        </h3>
                        <span className="text-xs text-slate-500">
                          {secFields.length} field(s) defined
                        </span>
                      </div>

                      {secFields.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-6">No fields in this section.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm text-slate-300">
                            <thead>
                              <tr className="border-b border-white/5 text-xs text-slate-400 uppercase tracking-wider">
                                <th className="pb-2 font-semibold">Label (Key)</th>
                                <th className="pb-2 font-semibold">Type</th>
                                <th className="pb-2 font-semibold">Required</th>
                                <th className="pb-2 font-semibold">Options / Details</th>
                                <th className="pb-2 font-semibold">Order</th>
                                <th className="pb-2 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {secFields.map((field) => (
                                <tr key={field._id} className="group hover:bg-white/[0.01]">
                                  {editingFieldId === field._id ? (
                                    // Field inline edit fields
                                    <td colSpan={6} className="py-3">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-lg border border-indigo-900/40">
                                        <div>
                                          <label className="block text-[10px] font-bold uppercase text-slate-400">Label</label>
                                          <input
                                            type="text"
                                            value={editFieldLabel}
                                            onChange={(e) => setEditFieldLabel(e.target.value)}
                                            className="glass-input w-full px-2 py-1 rounded text-xs mt-1 text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold uppercase text-slate-400">Key Name</label>
                                          <input
                                            type="text"
                                            value={editFieldName}
                                            onChange={(e) => setEditFieldName(e.target.value)}
                                            className="glass-input w-full px-2 py-1 rounded text-xs mt-1 text-white"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold uppercase text-slate-400">Section</label>
                                          <select
                                            value={editFieldSection}
                                            onChange={(e) => setEditFieldSection(e.target.value)}
                                            className="glass-input w-full px-2 py-1 rounded text-xs mt-1 text-white"
                                          >
                                            {sections.map((s) => (
                                              <option key={s._id} value={s._id}>
                                                {s.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold uppercase text-slate-400">Type</label>
                                          <select
                                            value={editFieldType}
                                            onChange={(e) => setEditFieldType(e.target.value as any)}
                                            className="glass-input w-full px-2 py-1 rounded text-xs mt-1 text-white"
                                          >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="select">Select</option>
                                            <option value="boolean">Boolean</option>
                                            <option value="image">Image Upload</option>
                                            <option value="video">Video Upload</option>
                                            <option value="link">External Link</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[10px] font-bold uppercase text-slate-400">Sort Order</label>
                                          <input
                                            type="number"
                                            value={editFieldOrder}
                                            onChange={(e) => setEditFieldOrder(parseInt(e.target.value) || 0)}
                                            className="glass-input w-full px-2 py-1 rounded text-xs mt-1 text-white"
                                          />
                                        </div>
                                        <div className="flex items-center space-x-2 pt-4">
                                          <input
                                            type="checkbox"
                                            id={`edit-req-${field._id}`}
                                            checked={editFieldRequired}
                                            onChange={(e) => setEditFieldRequired(e.target.checked)}
                                            className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                                          />
                                          <label htmlFor={`edit-req-${field._id}`} className="text-xs text-slate-300">
                                            Required
                                          </label>
                                        </div>
                                        {editFieldType === 'select' && (
                                          <div className="md:col-span-3">
                                            <label className="block text-[10px] font-bold uppercase text-slate-400">Dropdown Options (Comma-separated)</label>
                                            <input
                                              type="text"
                                              value={editFieldOptions}
                                              onChange={(e) => setEditFieldOptions(e.target.value)}
                                              className="glass-input w-full px-2 py-1 rounded text-xs mt-1 text-white"
                                              placeholder="D, E, F"
                                            />
                                          </div>
                                        )}
                                        {editFieldType === 'image' && (
                                          <div className="md:col-span-3 flex items-start space-x-2 bg-violet-950/20 border border-violet-900/30 rounded px-2.5 py-2">
                                            <Image className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] text-violet-300">Image upload via Multer — a file picker will be shown on the diamond entry form.</p>
                                          </div>
                                        )}
                                        {editFieldType === 'video' && (
                                          <div className="md:col-span-3 flex items-start space-x-2 bg-blue-950/20 border border-blue-900/30 rounded px-2.5 py-2">
                                            <Video className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] text-blue-300">Video upload via Multer (up to 50 MB) — an inline preview player will be shown after upload.</p>
                                          </div>
                                        )}
                                        {editFieldType === 'link' && (
                                          <div className="md:col-span-3 flex items-start space-x-2 bg-emerald-950/20 border border-emerald-900/30 rounded px-2.5 py-2">
                                            <Link2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-[10px] text-emerald-300">URL text input — renders as a clickable hyperlink on the public diamond detail page.</p>
                                          </div>
                                        )}
                                        <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
                                          <button
                                            onClick={() => setEditingFieldId(null)}
                                            className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleUpdateField(field._id)}
                                            className="px-3 py-1 rounded bg-indigo-600 text-white text-xs hover:bg-indigo-700"
                                          >
                                            Save Changes
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  ) : (
                                    <>
                                      <td className="py-3">
                                        <div className="font-semibold text-slate-200">{field.label}</div>
                                        <div className="text-xs text-slate-500 font-mono">{field.name}</div>
                                      </td>
                                      <td className="py-3">
                                        {(() => {
                                          const typeConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
                                            text:    { label: 'Text',    icon: <Type className="w-3 h-3" />,       color: 'bg-slate-800 text-slate-300 border-slate-700' },
                                            number:  { label: 'Number',  icon: <Hash className="w-3 h-3" />,       color: 'bg-blue-950/40 text-blue-300 border-blue-900/40' },
                                            select:  { label: 'Select',  icon: <List className="w-3 h-3" />,       color: 'bg-amber-950/40 text-amber-300 border-amber-900/40' },
                                            boolean: { label: 'Boolean', icon: <ToggleLeft className="w-3 h-3" />, color: 'bg-teal-950/40 text-teal-300 border-teal-900/40' },
                                            image:   { label: 'Image',   icon: <Image className="w-3 h-3" />,      color: 'bg-violet-950/40 text-violet-300 border-violet-900/40' },
                                            video:   { label: 'Video',   icon: <Video className="w-3 h-3" />,      color: 'bg-indigo-950/40 text-indigo-300 border-indigo-900/40' },
                                            link:    { label: 'Link',    icon: <Link2 className="w-3 h-3" />,      color: 'bg-emerald-950/40 text-emerald-300 border-emerald-900/40' },
                                          };
                                          const cfg = typeConfig[field.type] ?? { label: field.type, icon: null, color: 'bg-slate-800 text-slate-400 border-slate-700' };
                                          return (
                                            <span className={`inline-flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cfg.color}`}>
                                              {cfg.icon}
                                              <span>{cfg.label}</span>
                                            </span>
                                          );
                                        })()}
                                      </td>
                                      <td className="py-3">
                                        {field.required ? (
                                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-950/45 text-red-400 border border-red-900/30">
                                            Yes
                                          </span>
                                        ) : (
                                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800">
                                            No
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-3 text-xs max-w-[200px] truncate text-slate-400">
                                        {field.type === 'select' ? (
                                          <span className="bg-slate-900/70 border border-slate-800 px-1.5 py-0.5 rounded">
                                            {field.options?.join(', ')}
                                          </span>
                                        ) : field.type === 'image' ? (
                                          <span className="flex items-center space-x-1 text-violet-400">
                                            <Image className="w-3 h-3" />
                                            <span>File upload (image/*)</span>
                                          </span>
                                        ) : field.type === 'video' ? (
                                          <span className="flex items-center space-x-1 text-indigo-400">
                                            <Video className="w-3 h-3" />
                                            <span>File upload (video/*)</span>
                                          </span>
                                        ) : field.type === 'link' ? (
                                          <span className="flex items-center space-x-1 text-emerald-400">
                                            <Link2 className="w-3 h-3" />
                                            <span>URL input</span>
                                          </span>
                                        ) : (
                                          <span className="italic text-slate-600">—</span>
                                        )}
                                      </td>
                                      <td className="py-3 text-slate-400">#{field.order}</td>
                                      <td className="py-3 text-right">
                                        <div className="flex items-center justify-end space-x-1.5">
                                          <button
                                            onClick={() => handleEditFieldClick(field)}
                                            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                            title="Edit Field"
                                          >
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteField(field._id)}
                                            className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                            title="Delete Field"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

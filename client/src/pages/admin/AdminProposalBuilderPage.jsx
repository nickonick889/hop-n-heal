import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Pencil, Trash2, X, Stethoscope,
  BedDouble, Car, Sparkles, StickyNote, Check,
} from 'lucide-react';
import api from '../../api/axios';

// ─── Constants ────────────────────────────────────────────────────

const DURATION_DAYS = { '3–5 days': 5, '1 week': 7, '2 weeks+': 14 };

const STATUSES = ['drafting', 'sent', 'awaiting_payment', 'confirmed'];
const STATUS_LABELS = {
  drafting:         'Drafting',
  sent:             'Sent to client',
  awaiting_payment: 'Awaiting payment',
  confirmed:        'Confirmed',
};
const STATUS_COLOURS = {
  drafting:         'bg-surface-alt text-muted',
  sent:             'bg-blue-500/15 text-blue-400',
  awaiting_payment: 'bg-yellow-500/15 text-yellow-500',
  confirmed:        'bg-green-500/15 text-green-400',
};

const ITEM_TYPES = [
  { value: 'medical',       label: 'Medical',       icon: Stethoscope },
  { value: 'accommodation', label: 'Accommodation',  icon: BedDouble   },
  { value: 'transport',     label: 'Transport',      icon: Car         },
  { value: 'activity',      label: 'Activity',       icon: Sparkles    },
  { value: 'note',          label: 'Custom note',    icon: StickyNote  },
];

const CATEGORY_LABELS = {
  medical: 'Medical', accommodation: 'Accommodation',
  transport: 'Transport', activity: 'Activities', food_restriction: 'Dietary',
};

// ─── Helpers ──────────────────────────────────────────────────────

function ItemIcon({ type, size = 14 }) {
  const found = ITEM_TYPES.find(t => t.value === type);
  const Icon = found?.icon || StickyNote;
  return <Icon size={size} className="shrink-0" />;
}

const inp = 'w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors';

// ─── Page ─────────────────────────────────────────────────────────

export default function AdminProposalBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal,     setProposal]     = useState(null);
  const [items,        setItems]        = useState([]);
  const [form,         setForm]         = useState({ status: 'drafting', total_price: '', client_message: '', admin_notes: '' });
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [savedMsg,     setSavedMsg]     = useState('');
  const [converting,   setConverting]   = useState(false);

  // Catalog fetched from public content endpoints
  const [catalog, setCatalog] = useState({ services: [], stay: [], transport: [], activities: [] });

  // Modal state
  const [modal,     setModal]     = useState(null); // null | { mode:'add', day:N } | { mode:'edit', item:{} }
  const [itemForm,  setItemForm]  = useState({ item_type: 'medical', title: '', description: '', price: '', day_number: 1 });
  const [itemSaving, setItemSaving] = useState(false);

  // ─── Fetch proposal ────────────────────────────────────────────

  const fetchProposal = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/admin/proposals/${id}`);
      setProposal(data.proposal);
      setItems(data.proposal.items || []);
      setForm({
        status:         data.proposal.status         || 'drafting',
        total_price:    data.proposal.total_price     != null ? String(data.proposal.total_price) : '',
        client_message: data.proposal.client_message  || '',
        admin_notes:    data.proposal.admin_notes     || '',
      });
    } catch {
      navigate('/admin/proposals');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchProposal(); }, [fetchProposal]);

  // Fetch content catalog for item picker
  useEffect(() => {
    Promise.all([
      api.get('/api/services'),
      api.get('/api/stay'),
      api.get('/api/transport'),
      api.get('/api/activities'),
    ]).then(([s, st, t, a]) => setCatalog({
      services:    s.data.services        || [],
      stay:        st.data.accommodations || [],
      transport:   t.data.transport       || [],
      activities:  a.data.activities      || [],
    })).catch(() => {});
  }, []);

  // ─── Proposal save ─────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true); setSavedMsg('');
    try {
      await api.put(`/api/admin/proposals/${id}`, {
        ...form,
        total_price: form.total_price ? Number(form.total_price) : null,
      });
      setSavedMsg('Saved');
      setTimeout(() => setSavedMsg(''), 2500);
    } finally {
      setSaving(false);
    }
  };

  // ─── Convert to booking ────────────────────────────────────────

  const handleConvert = async () => {
    if (!window.confirm('Convert this proposal to a confirmed booking? This will mark the enquiry as converted.')) return;
    setConverting(true);
    try {
      const { data } = await api.post(`/api/admin/proposals/${id}/convert`);
      navigate(`/admin/bookings`);
      // brief flash before nav
      void data;
    } finally {
      setConverting(false);
    }
  };

  // ─── Item modal ────────────────────────────────────────────────

  const openAdd = (day) => {
    setItemForm({ item_type: 'medical', title: '', description: '', price: '', day_number: day });
    setModal({ mode: 'add', day });
  };

  const openEdit = (item) => {
    setItemForm({
      item_type:   item.item_type,
      title:       item.title,
      description: item.description || '',
      price:       item.price != null ? String(item.price) : '',
      day_number:  item.day_number,
    });
    setModal({ mode: 'edit', item });
  };

  const handleItemSave = async () => {
    if (!itemForm.title.trim()) return;
    setItemSaving(true);
    try {
      const payload = {
        ...itemForm,
        price: itemForm.price ? Number(itemForm.price) : null,
      };
      if (modal.mode === 'add') {
        const { data } = await api.post(`/api/admin/proposals/${id}/items`, payload);
        setItems(prev => [...prev, data.item]);
      } else {
        const { data } = await api.put(`/api/admin/proposals/${id}/items/${modal.item.id}`, payload);
        setItems(prev => prev.map(it => it.id === data.item.id ? data.item : it));
      }
      setModal(null);
    } finally {
      setItemSaving(false);
    }
  };

  const handleItemDelete = async (itemId) => {
    await api.delete(`/api/admin/proposals/${id}/items/${itemId}`);
    setItems(prev => prev.filter(it => it.id !== itemId));
  };

  // ─── Catalog selection helper ──────────────────────────────────

  const catalogForType = (type) => {
    if (type === 'medical')       return catalog.services.map(s  => ({ label: s.title,        price: s.price_from }));
    if (type === 'accommodation') return catalog.stay.map(s       => ({ label: s.name,         price: s.price_from }));
    if (type === 'transport')     return catalog.transport.map(s  => ({ label: s.vehicle_type, price: s.price_from }));
    if (type === 'activity')      return catalog.activities.map(s => ({ label: s.title,        price: s.price_from }));
    return [];
  };

  // ─── Derived values ────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface border border-border rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const enquiry  = proposal?.enquiry;
  const numDays  = DURATION_DAYS[enquiry?.duration_days] || 7;
  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0), 0);

  const byDay = items.reduce((acc, it) => {
    (acc[it.day_number] = acc[it.day_number] || []).push(it);
    return acc;
  }, {});

  const interests = enquiry?.interests || [];
  const grouped = interests.reduce((acc, i) => {
    (acc[i.category] = acc[i.category] || []).push(i.option_value);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-4xl">

      {/* Back */}
      <button onClick={() => navigate('/admin/proposals')}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-text transition-colors mb-6">
        <ArrowLeft size={15} /> Back to proposals
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Proposal — {enquiry?.full_name}
          </h1>
          <p className="text-sm text-muted mt-1">{enquiry?.email}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_COLOURS[proposal?.status] || 'bg-surface-alt text-muted'}`}>
          {STATUS_LABELS[proposal?.status] || proposal?.status}
        </span>
      </div>

      {/* Enquiry summary */}
      <div className="bg-surface border border-border rounded-2xl p-5 mb-8">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Enquiry summary</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text mb-3">
          <span><span className="text-muted">Group: </span>{enquiry?.group_size}</span>
          <span><span className="text-muted">Duration: </span>{enquiry?.duration_days}</span>
          <span><span className="text-muted">Budget: </span>{enquiry?.budget_range}</span>
          {enquiry?.travel_dates && <span><span className="text-muted">Travel dates: </span>{enquiry.travel_dates}</span>}
          {enquiry?.food_budget  && <span><span className="text-muted">Food budget: </span>{enquiry.food_budget}</span>}
        </div>
        {Object.keys(grouped).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {Object.entries(grouped).map(([cat, vals]) => (
              vals.map(v => (
                <span key={`${cat}-${v}`} className="text-xs bg-surface-alt border border-border text-muted px-2.5 py-1 rounded-full">
                  {CATEGORY_LABELS[cat] ? `${CATEGORY_LABELS[cat]}: ` : ''}{v}
                </span>
              ))
            ))}
          </div>
        )}
      </div>

      {/* ─── Day-by-day itinerary ─── */}
      <div className="space-y-6 mb-10">
        {Array.from({ length: numDays }, (_, i) => i + 1).map(day => (
          <div key={day} className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-text">Day {day}</p>
              <button onClick={() => openAdd(day)}
                className="flex items-center gap-1.5 text-xs text-accent hover:bg-accent/10 px-3 py-1.5 rounded-full transition-colors border border-accent/30">
                <Plus size={12} /> Add item
              </button>
            </div>

            {(byDay[day] || []).length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted">Nothing planned yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {(byDay[day] || []).map(item => (
                  <div key={item.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="text-muted mt-0.5"><ItemIcon type={item.item_type} /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text">{item.title}</p>
                      {item.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{item.description}</p>}
                    </div>
                    {item.price != null && (
                      <span className="text-sm font-medium text-accent shrink-0">SGD {Number(item.price).toLocaleString()}</span>
                    )}
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-muted hover:text-text transition-colors rounded-lg hover:bg-surface-alt">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleItemDelete(item.id)} className="p-1.5 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-surface-alt">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Proposal details ─── */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        <p className="text-sm font-semibold text-text">Proposal details</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inp}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">
              Total price charged to client (SGD)
              {subtotal > 0 && <span className="ml-2 text-muted-dark">item subtotal: {subtotal.toLocaleString()}</span>}
            </label>
            <input
              type="number" min="0" step="0.01"
              value={form.total_price}
              onChange={e => setForm(f => ({ ...f, total_price: e.target.value }))}
              placeholder={subtotal > 0 ? String(subtotal) : '0.00'}
              className={inp}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Message to client <span className="text-muted-dark">(included in the proposal deck)</span></label>
          <textarea rows={4} value={form.client_message}
            onChange={e => setForm(f => ({ ...f, client_message: e.target.value }))}
            placeholder="Hi [Name], we've put together a plan based on your enquiry…"
            className={`${inp} resize-none`} />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Internal notes <span className="text-muted-dark">(admin only)</span></label>
          <textarea rows={3} value={form.admin_notes}
            onChange={e => setForm(f => ({ ...f, admin_notes: e.target.value }))}
            placeholder="Waiting on hospital availability confirmation…"
            className={`${inp} resize-none`} />
        </div>

        <div className="flex items-center justify-between pt-2 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving}
              className="bg-accent text-[#080808] font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-accent-hover disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {savedMsg && (
              <span className="flex items-center gap-1.5 text-sm text-green-400">
                <Check size={14} /> {savedMsg}
              </span>
            )}
          </div>

          {(form.status === 'awaiting_payment' || form.status === 'confirmed') && (
            <button onClick={handleConvert} disabled={converting}
              className="border border-green-500/40 text-green-400 hover:bg-green-500/10 font-medium px-5 py-2.5 rounded-full text-sm transition-colors disabled:opacity-60">
              {converting ? 'Converting…' : 'Convert to booking →'}
            </button>
          )}
        </div>
      </div>

      {/* ─── Add / Edit item modal ─── */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-text">
                {modal.mode === 'add' ? `Add item — Day ${modal.day}` : 'Edit item'}
              </h2>
              <button onClick={() => setModal(null)} className="text-muted hover:text-text"><X size={16} /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-xs text-muted mb-1.5">Type</label>
                <div className="flex flex-wrap gap-2">
                  {ITEM_TYPES.map(({ value, label, icon: Icon }) => (
                    <button key={value} type="button"
                      onClick={() => setItemForm(f => ({ ...f, item_type: value, title: '', price: '' }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        itemForm.item_type === value
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted hover:border-accent/50'
                      }`}>
                      <Icon size={11} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Catalog picker (not shown for 'note') */}
              {itemForm.item_type !== 'note' && catalogForType(itemForm.item_type).length > 0 && (
                <div>
                  <label className="block text-xs text-muted mb-1.5">Pick from catalog <span className="text-muted-dark">(optional)</span></label>
                  <div className="max-h-36 overflow-y-auto space-y-1 border border-border rounded-xl p-2 bg-bg">
                    {catalogForType(itemForm.item_type).map(({ label, price }) => (
                      <button key={label} type="button"
                        onClick={() => setItemForm(f => ({ ...f, title: label, price: price != null ? String(price) : '' }))}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                          itemForm.title === label ? 'bg-accent/10 text-accent' : 'text-muted hover:bg-surface-alt hover:text-text'
                        }`}>
                        <span>{label}</span>
                        {price != null && <span className="text-muted-dark">SGD {Number(price).toLocaleString()}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Day (only in edit mode so admin can move items) */}
              {modal.mode === 'edit' && (
                <div>
                  <label className="block text-xs text-muted mb-1.5">Day</label>
                  <select value={itemForm.day_number}
                    onChange={e => setItemForm(f => ({ ...f, day_number: Number(e.target.value) }))}
                    className={inp}>
                    {Array.from({ length: numDays }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>Day {d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs text-muted mb-1.5">Title</label>
                <input type="text" value={itemForm.title}
                  onChange={e => setItemForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Airport transfer, Check-in…"
                  className={inp} />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs text-muted mb-1.5">Price (SGD) <span className="text-muted-dark">(optional)</span></label>
                <input type="number" min="0" step="0.01" value={itemForm.price}
                  onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0.00" className={inp} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-muted mb-1.5">Notes <span className="text-muted-dark">(optional)</span></label>
                <input type="text" value={itemForm.description}
                  onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Any specific details…"
                  className={inp} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="text-sm text-muted border border-border px-4 py-2 rounded-full hover:border-accent/50 transition-colors">Cancel</button>
              <button onClick={handleItemSave} disabled={itemSaving || !itemForm.title.trim()}
                className="text-sm bg-accent text-[#080808] font-semibold px-5 py-2 rounded-full hover:bg-accent-hover disabled:opacity-60 transition-colors">
                {itemSaving ? 'Saving…' : modal.mode === 'add' ? 'Add to itinerary' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

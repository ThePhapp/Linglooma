import { useCallback, useEffect, useState } from 'react';
import { BookMarked, Check, Plus, RotateCcw, Search } from 'lucide-react';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';

const emptyForm = { word: '', meaning: '', example: '', topic: '', difficulty: 'medium' };

export default function VocabularyPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await apiClient.get('/api/learning/vocabulary', { params: { search } }); setItems(Array.isArray(response.data) ? response.data : []); }
    catch { setError('Your vocabulary bank could not be loaded.'); }
    finally { setLoading(false); }
  }, [search]);
  useEffect(() => { const timer = setTimeout(load, 300); return () => clearTimeout(timer); }, [load]);

  const submit = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try { const response = await apiClient.post('/api/learning/vocabulary', form); setItems(values => [response.data, ...values.filter(item => item.id !== response.data.id)]); setForm(emptyForm); }
    catch (requestError) { setError(requestError.response?.data?.message || 'The word could not be saved.'); }
    finally { setSaving(false); }
  };
  const review = async (item, known) => {
    const response = await apiClient.patch(`/api/learning/vocabulary/${item.id}/review`, { known });
    setItems(values => values.map(value => value.id === item.id ? response.data : value));
  };

  return (
    <main className="page-shell">
      <PageHeader eyebrow="Vocabulary review" title="Vocabulary Bank" description="Save useful IELTS vocabulary from feedback, passages, speaking practice, or your own study." />
      {error && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 xl:sticky xl:top-24"><div className="flex items-center gap-2"><Plus className="h-5 w-5 text-brand-700" /><h2 className="font-bold text-slate-950">Add a word</h2></div><div className="mt-5 space-y-4"><label><span className="form-label">Word</span><input className="form-control" required maxLength="200" value={form.word} onChange={event => setForm(value => ({ ...value, word: event.target.value }))} /></label><label><span className="form-label">Meaning</span><textarea className="form-control min-h-24" required value={form.meaning} onChange={event => setForm(value => ({ ...value, meaning: event.target.value }))} /></label><label><span className="form-label">Example</span><textarea className="form-control min-h-20" value={form.example} onChange={event => setForm(value => ({ ...value, example: event.target.value }))} /></label><div className="grid grid-cols-2 gap-3"><label><span className="form-label">Topic</span><input className="form-control" value={form.topic} onChange={event => setForm(value => ({ ...value, topic: event.target.value }))} /></label><label><span className="form-label">Difficulty</span><select className="form-control" value={form.difficulty} onChange={event => setForm(value => ({ ...value, difficulty: event.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div></div><Button type="submit" className="mt-5 w-full" isLoading={saving}>Save word</Button></form>
        <section><label className="relative block"><span className="sr-only">Search vocabulary</span><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" /><input className="form-control pl-10" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search words, meanings, or topics" /></label>{loading ? <div className="mt-4 space-y-3"><Skeleton className="h-44" /><Skeleton className="h-44" /></div> : !items.length ? <StatePanel className="mt-4" icon={<BookMarked className="h-5 w-5" />} title="Your vocabulary bank is empty" description="Add your first word using the form." /> : <div className="mt-4 grid gap-4 md:grid-cols-2">{items.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-bold text-slate-950">{item.word}</h3><p className="mt-1 text-xs font-semibold capitalize text-slate-500">{item.topic || 'General'} · {item.difficulty}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'known' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></div>{revealed[item.id] ? <div className="mt-4"><p className="text-sm leading-6 text-slate-700">{item.meaning}</p>{item.example && <p className="mt-3 border-l-2 border-brand-300 pl-3 text-sm italic leading-6 text-slate-600">{item.example}</p>}</div> : <button type="button" onClick={() => setRevealed(value => ({ ...value, [item.id]: true }))} className="mt-5 min-h-11 w-full rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50">Reveal meaning</button>}<div className="mt-5 flex gap-2 border-t border-slate-200 pt-4"><Button size="small" onClick={() => review(item, true)}><Check className="h-4 w-4" /> Know</Button><Button size="small" variant="secondary" onClick={() => review(item, false)}><RotateCcw className="h-4 w-4" /> Review later</Button></div></article>)}</div>}</section>
      </div>
    </main>
  );
}

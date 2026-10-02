import { useCallback, useEffect, useState } from 'react';
import { Bookmark, RefreshCw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import Skeleton from '@/components/ui/Skeleton';
import StatePanel from '@/components/ui/StatePanel';

export default function SavedPage() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await apiClient.get('/api/learning/bookmarks'); setItems(response.data || []); } catch { setError('Saved items could not be loaded.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const remove = async id => { await apiClient.delete(`/api/learning/bookmarks/${id}`); setItems(values => values.filter(item => item.id !== id)); };
  return <main className="page-shell"><PageHeader eyebrow="Bookmarks" title="Saved" description="Return to bookmarked passages, writing prompts, feedback, mistakes, and vocabulary." />{loading ? <div className="mt-6 space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div> : error ? <StatePanel className="mt-6" tone="error" icon={<RefreshCw className="h-5 w-5" />} title="Saved items unavailable" description={error} action={<Button onClick={load}>Try again</Button>} /> : !items.length ? <StatePanel className="mt-6" icon={<Bookmark className="h-5 w-5" />} title="Nothing saved yet" description="Use Save on a reading passage or writing prompt to keep it here." /> : <div className="mt-6 grid gap-3">{items.map(item => <article key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Bookmark className="h-5 w-5" /></span><Link to={item.href} className="min-w-0 flex-1"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.item_type}</span><strong className="mt-1 block truncate text-slate-950">{item.title}</strong></Link><button type="button" onClick={() => remove(item.id)} className="flex h-10 w-10 items-center justify-center rounded-lg text-red-600 hover:bg-red-50" aria-label={`Remove ${item.title}`}><Trash2 className="h-4 w-4" /></button></article>)}</div>}</main>;
}

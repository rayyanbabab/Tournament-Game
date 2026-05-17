'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Bold, Italic, Underline, List, ListOrdered, Image as ImageIcon,
  Heading2, Heading3, Quote, Minus, Eye, Edit3,
  Save, Send, Loader2, Upload, X, CheckCircle2, AlertCircle,
} from 'lucide-react'

interface Props {
  initialData?: {
    id?: string
    title?: string
    slug?: string
    excerpt?: string
    content?: string
    cover_image_url?: string
    category?: string
    published?: boolean
  }
}

const CATEGORIES = ['Umum', 'Pengumuman', 'Rekap Turnamen', 'Berita Game', 'Tips & Trik', 'Wawancara']

export function NewsEditor({ initialData }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const editorRef = useRef<HTMLDivElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'Umum')
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_image_url ?? '')
  const [published, setPublished] = useState(initialData?.published ?? false)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60)

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (!initialData?.id) setSlug(generateSlug(v))
  }

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
  }

  const insertHTML = (html: string) => {
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (!sel?.rangeCount) return
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const node = document.createElement('div')
    node.innerHTML = html
    const frag = document.createDocumentFragment()
    let lastNode: Node | null = null
    while (node.firstChild) {
      lastNode = frag.appendChild(node.firstChild)
    }
    range.insertNode(frag)
    if (lastNode) {
      const newRange = document.createRange()
      newRange.setStartAfter(lastNode)
      newRange.collapse(true)
      sel.removeAllRanges()
      sel.addRange(newRange)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `news/cover-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('tournaments').upload(filePath, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('tournaments').getPublicUrl(filePath)
      setCoverUrl(publicUrl)
      showToast('success', 'Cover berhasil diupload!')
    } catch (e: any) {
      showToast('error', `Upload gagal: ${e.message}`)
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  const getContent = () => editorRef.current?.innerHTML ?? ''

  const handleSave = async (publish?: boolean) => {
    if (!title.trim()) { showToast('error', 'Judul wajib diisi'); return }
    if (!slug.trim()) { showToast('error', 'Slug wajib diisi'); return }
    const content = getContent()
    if (!content || content === '<br>') { showToast('error', 'Isi artikel tidak boleh kosong'); return }

    setSaving(true)
    const isPublished = publish !== undefined ? publish : published

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content,
        cover_image_url: coverUrl || null,
        category,
        published: isPublished,
        updated_at: new Date().toISOString(),
      }

      let error: any
      if (initialData?.id) {
        ;({ error } = await supabase.from('news_articles').update(payload).eq('id', initialData.id))
      } else {
        ;({ error } = await supabase.from('news_articles').insert(payload))
      }

      if (error) throw error

      setPublished(isPublished)
      showToast('success', isPublished ? 'Artikel dipublikasikan!' : 'Draft disimpan!')
      setTimeout(() => router.push('/admin/news'), 1000)
    } catch (e: any) {
      showToast('error', e.message)
    } finally {
      setSaving(false)
    }
  }

  const ToolbarBtn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
    >
      {children}
    </button>
  )

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setPreview(!preview)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            preview ? 'bg-primary text-primary-foreground border-primary' : 'border-border/60 hover:bg-accent'
          }`}
        >
          {preview ? <Edit3 className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {preview ? 'Edit' : 'Preview'}
        </button>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg border border-border/60 hover:bg-accent transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Simpan Draft
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Publikasikan
          </button>
        </div>
      </div>

      {/* Cover image */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {coverUrl ? (
          <div className="relative group">
            <img src={coverUrl} alt="Cover" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button onClick={() => coverInputRef.current?.click()} className="px-3 py-1.5 text-xs font-medium bg-white text-black rounded-lg">Ganti</button>
              <button onClick={() => setCoverUrl('')} className="px-3 py-1.5 text-xs font-medium bg-destructive text-white rounded-lg">Hapus</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="w-full h-32 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-colors border-b border-border/60"
          >
            {uploadingCover ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-8 w-8 opacity-40" />}
            <span className="text-sm">{uploadingCover ? 'Mengupload...' : 'Klik untuk upload gambar cover'}</span>
          </button>
        )}
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />

        <div className="p-4 space-y-3">
          {/* Title */}
          <input
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Judul artikel..."
            className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 text-foreground"
          />
          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Ringkasan singkat artikel (opsional)..."
            rows={2}
            className="w-full text-sm bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/40 text-muted-foreground"
          />
          {/* Meta row */}
          <div className="flex items-center gap-3 pt-1 border-t border-border/60">
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-muted-foreground">Slug:</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="text-xs font-mono bg-muted px-2 py-1 rounded-md border border-border/60 outline-none focus:ring-1 focus:ring-primary/40 w-48"
                placeholder="url-artikel"
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="text-xs bg-muted px-2 py-1 rounded-md border border-border/60 outline-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {!preview && (
          <div className="flex items-center gap-1 px-4 py-2 border-b border-border/60 bg-muted/20 flex-wrap">
            <ToolbarBtn onClick={() => exec('bold')} title="Bold"><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec('italic')} title="Italic"><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec('underline')} title="Underline"><Underline className="h-3.5 w-3.5" /></ToolbarBtn>
            <div className="w-px h-4 bg-border/60 mx-1" />
            <ToolbarBtn onClick={() => exec('formatBlock', '<h2>')} title="Heading 2"><Heading2 className="h-3.5 w-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec('formatBlock', '<h3>')} title="Heading 3"><Heading3 className="h-3.5 w-3.5" /></ToolbarBtn>
            <div className="w-px h-4 bg-border/60 mx-1" />
            <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Bullet list"><List className="h-3.5 w-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec('insertOrderedList')} title="Numbered list"><ListOrdered className="h-3.5 w-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={() => exec('formatBlock', '<blockquote>')} title="Kutipan"><Quote className="h-3.5 w-3.5" /></ToolbarBtn>
            <ToolbarBtn onClick={() => insertHTML('<hr/>')} title="Garis pemisah"><Minus className="h-3.5 w-3.5" /></ToolbarBtn>
          </div>
        )}

        {preview ? (
          <div
            className="p-6 prose prose-sm dark:prose-invert max-w-none min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: getContent() }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="p-6 min-h-[350px] outline-none text-foreground prose prose-sm dark:prose-invert max-w-none focus:outline-none"
            style={{ whiteSpace: 'pre-wrap' }}
            data-placeholder="Mulai tulis artikel di sini..."
            dangerouslySetInnerHTML={{ __html: initialData?.content ?? '' }}
            onInput={() => {}}
          />
        )}
      </div>

      {/* CSS for placeholder */}
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          opacity: 0.5;
          pointer-events: none;
        }
        .prose h2 { font-size: 1.3rem; font-weight: 700; margin: 1.2rem 0 0.5rem; }
        .prose h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.4rem; }
        .prose blockquote { border-left: 3px solid hsl(var(--primary)); padding-left: 1rem; color: hsl(var(--muted-foreground)); font-style: italic; }
        .prose hr { border-color: hsl(var(--border)); margin: 1.5rem 0; }
        .prose ul { list-style: disc; padding-left: 1.5rem; }
        .prose ol { list-style: decimal; padding-left: 1.5rem; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

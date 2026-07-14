'use client'

import { useState, useRef } from 'react'
import { CertificateCanvas, CertificateCanvasHandle, CertificateData, CERT_W, CERT_H, drawCertificate } from './certificate-canvas'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, FileImage, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface CertificateDownloadProps {
  data: CertificateData
  fileName?: string
  showPreview?: boolean
}

export function CertificateDownload({ data, fileName, showPreview = true }: CertificateDownloadProps) {
  const [downloading, setDownloading] = useState<'pdf' | 'png' | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const certRef = useRef<CertificateCanvasHandle>(null)

  const safeName = fileName ?? `sertifikat-${data.teamName.toLowerCase().replace(/\s+/g, '-')}`

  /**
   * Get or create a full-resolution canvas with the certificate drawn on it.
   * Uses the hidden offscreen canvas via ref — no html2canvas, no CSS parsing.
   */
  const getFullResCanvas = (): HTMLCanvasElement => {
    // Try to reuse the existing canvas from the ref
    const existing = certRef.current?.getCanvas()
    if (existing) {
      // Re-draw to ensure it's up to date
      drawCertificate(existing, data)
      return existing
    }
    // Fallback: create a fresh canvas
    const canvas = document.createElement('canvas')
    drawCertificate(canvas, data)
    return canvas
  }

  const downloadPNG = async () => {
    setDownloading('png')
    try {
      const canvas = getFullResCanvas()
      const link = document.createElement('a')
      link.download = `${safeName}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Sertifikat berhasil diunduh sebagai PNG!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal mengunduh sertifikat')
    } finally {
      setDownloading(null)
    }
  }

  const downloadPDF = async () => {
    setDownloading('pdf')
    try {
      const canvas = getFullResCanvas()
      const { jsPDF } = await import('jspdf')
      const imgData = canvas.toDataURL('image/png', 1.0)
      // A4 landscape: 297 × 210 mm
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
      pdf.save(`${safeName}.pdf`)
      toast.success('Sertifikat berhasil diunduh sebagai PDF!')
    } catch (err) {
      console.error(err)
      toast.error('Gagal mengunduh sertifikat PDF')
    } finally {
      setDownloading(null)
    }
  }

  // Scale preview to fit card width
  const PREVIEW_W = 560
  const scale = PREVIEW_W / CERT_W

  return (
    <div className="flex flex-col gap-4">
      {/* Preview toggle */}
      {showPreview && (
        <Button
          variant="outline"
          size="sm"
          className="w-fit gap-2 self-start"
          onClick={() => setPreviewing((p) => !p)}
        >
          <Eye className="h-3.5 w-3.5" />
          {previewing ? 'Sembunyikan Preview' : 'Lihat Preview'}
        </Button>
      )}

      {/* Visible preview (no ref needed — ref is on the hidden canvas) */}
      {previewing && (
        <div
          className="rounded-xl overflow-hidden border border-border/60 shadow-2xl"
          style={{ width: PREVIEW_W, height: Math.round(CERT_H * scale) }}
        >
          <CertificateCanvas data={data} scale={scale} />
        </div>
      )}

      {/* Hidden full-resolution canvas (ref attached here for download) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden',
          width: CERT_W,
          height: CERT_H,
        }}
      >
        <CertificateCanvas ref={certRef} data={data} scale={1} />
      </div>

      {/* Download buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={downloadPNG}
          disabled={!!downloading}
        >
          {downloading === 'png' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileImage className="h-3.5 w-3.5" />
          )}
          Unduh PNG
        </Button>
        <Button
          size="sm"
          className="gap-2"
          onClick={downloadPDF}
          disabled={!!downloading}
        >
          {downloading === 'pdf' ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
          Unduh PDF
        </Button>
      </div>
    </div>
  )
}

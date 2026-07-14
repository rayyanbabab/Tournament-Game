'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

export interface CertificateData {
  teamName: string
  tournamentName: string
  game: string
  startDate: string
  endDate: string
  rankLabel: string
  rank: number // 0 = participant, 1/2/3 = winner
  prizePool?: string | null
  organizerName?: string
  primaryColor?: string
  secondaryColor?: string
}

// ─── Canvas drawing dimensions (A4 landscape @ 96dpi) ───────────────────────
export const CERT_W = 1056
export const CERT_H = 748

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function hexAlpha(hex: string, alpha: number) {
  // hex is 6-char (#rrggbb), alpha 0–1
  const { r, g, b } = hexToRgb(hex.slice(0, 7))
  return `rgba(${r},${g},${b},${alpha})`
}

function getRankInfo(rank: number) {
  if (rank === 1) return { emoji: '🥇', label: 'JUARA 1', color: '#F59E0B', glow: 'rgba(245,158,11,0.7)' }
  if (rank === 2) return { emoji: '🥈', label: 'JUARA 2', color: '#94A3B8', glow: 'rgba(148,163,184,0.6)' }
  if (rank === 3) return { emoji: '🥉', label: 'JUARA 3', color: '#CD7C2E', glow: 'rgba(205,124,46,0.6)' }
  return { emoji: '🏅', label: 'PESERTA', color: '#A78BFA', glow: 'rgba(167,139,250,0.5)' }
}

// ─── Core draw function (pure Canvas 2D – no CSS, no html2canvas) ────────────
export function drawCertificate(canvas: HTMLCanvasElement, data: CertificateData) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const W = CERT_W
  const H = CERT_H
  canvas.width = W
  canvas.height = H

  const primary = data.primaryColor ?? '#7c3aed'
  const secondary = data.secondaryColor ?? '#a855f7'
  const organizer = data.organizerName ?? 'GameArena'
  const isWinner = data.rank > 0 && data.rank <= 3
  const rank = getRankInfo(data.rank)

  // ── 1. Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#0F0B1E'
  ctx.fillRect(0, 0, W, H)

  // ── 2. Radial gradient overlays ────────────────────────────────────────────
  const gradients = [
    { x: W * 0.2, y: H * 0.5, r: W * 0.4, color: primary, alpha: 0.12 },
    { x: W * 0.8, y: H * 0.2, r: W * 0.35, color: secondary, alpha: 0.1 },
    { x: W * 0.6, y: H * 0.9, r: W * 0.3, color: '#06B6D4', alpha: 0.08 },
  ]
  for (const g of gradients) {
    const radGrad = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, g.r)
    radGrad.addColorStop(0, hexAlpha(g.color, g.alpha))
    radGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = radGrad
    ctx.fillRect(0, 0, W, H)
  }

  // ── 3. Border frame ────────────────────────────────────────────────────────
  ctx.strokeStyle = hexAlpha(primary, 0.35)
  ctx.lineWidth = 1.5
  roundRect(ctx, 20, 20, W - 40, H - 40, 12)
  ctx.stroke()

  ctx.strokeStyle = hexAlpha(primary, 0.18)
  ctx.lineWidth = 0.8
  roundRect(ctx, 28, 28, W - 56, H - 56, 10)
  ctx.stroke()

  // ── 4. Corner ornaments ────────────────────────────────────────────────────
  ctx.strokeStyle = primary
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  const corners = [
    // [x1,y1, x2,y2, x3,y3] — L-shaped path
    [20, 80, 20, 20, 80, 20],
    [W - 80, 20, W - 20, 20, W - 20, 80],
    [20, H - 80, 20, H - 20, 80, H - 20],
    [W - 80, H - 20, W - 20, H - 20, W - 20, H - 80],
  ]
  for (const [x1, y1, x2, y2, x3, y3] of corners) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.stroke()
    // dot at corner
    ctx.fillStyle = primary
    ctx.beginPath()
    ctx.arc(x2, y2, 4, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── 5. Left accent bar ─────────────────────────────────────────────────────
  const barGrad = ctx.createLinearGradient(0, 44, 0, H - 44)
  barGrad.addColorStop(0, 'rgba(0,0,0,0)')
  barGrad.addColorStop(0.4, primary)
  barGrad.addColorStop(0.7, secondary)
  barGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = barGrad
  ctx.beginPath()
  ctx.roundRect(44, 44, 4, H - 88, 2)
  ctx.fill()

  // ── 6. Subtle circle pattern ───────────────────────────────────────────────
  ctx.strokeStyle = hexAlpha(primary, 0.04)
  ctx.lineWidth = 1
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.arc(150 + i * 140, H / 2, 120, 0, Math.PI * 2)
    ctx.stroke()
  }

  // ── 7. Text content ────────────────────────────────────────────────────────
  const cx = W / 2 // horizontal center
  let y = 90

  // Organizer name
  ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = hexAlpha(primary, 0.85)
  ctx.textAlign = 'center'
  ctx.letterSpacing = '0.25em'
  fillTextTracked(ctx, organizer.toUpperCase(), cx, y, 3.5)
  y += 22

  // Certificate type
  ctx.font = '600 11px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  fillTextTracked(ctx, `SERTIFIKAT ${isWinner ? 'PENGHARGAAN' : 'PARTISIPASI'}`, cx, y, 4)
  y += 20

  // Thin divider line
  const divGrad = ctx.createLinearGradient(cx - 30, 0, cx + 30, 0)
  divGrad.addColorStop(0, 'rgba(0,0,0,0)')
  divGrad.addColorStop(0.5, primary)
  divGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = divGrad
  ctx.fillRect(cx - 30, y, 60, 2)
  y += 20

  // Rank emoji (drawn as text)
  ctx.font = '52px serif'
  ctx.textAlign = 'center'
  ctx.shadowColor = rank.glow
  ctx.shadowBlur = 20
  ctx.fillText(rank.emoji, cx, y + 44)
  ctx.shadowBlur = 0
  y += 66

  // Rank label
  const rankFontSize = isWinner ? 28 : 20
  ctx.font = `800 ${rankFontSize}px "Segoe UI", Arial, sans-serif`
  ctx.fillStyle = rank.color
  ctx.shadowColor = rank.glow
  ctx.shadowBlur = 24
  fillTextTracked(ctx, rank.label, cx, y, 1.5)
  ctx.shadowBlur = 0
  y += rankFontSize + 16

  // "Diberikan kepada"
  ctx.font = '12px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.32)'
  fillTextTracked(ctx, 'Diberikan kepada', cx, y, 2.5)
  y += 18

  // Team name
  const teamFontSize = Math.max(28, Math.min(44, Math.floor(420 / Math.max(data.teamName.length, 1) * 2)))
  ctx.font = `900 ${teamFontSize}px "Segoe UI", Arial, sans-serif`
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = hexAlpha(primary, 0.6)
  ctx.shadowBlur = 30
  ctx.fillText(data.teamName, cx, y + teamFontSize * 0.8, W - 160)
  ctx.shadowBlur = 0
  y += teamFontSize + 18

  // Description
  ctx.font = '14px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.44)'
  ctx.fillText(
    `atas partisipasi${isWinner ? ' dan prestasi luar biasa' : ''} dalam turnamen`,
    cx, y, W - 200
  )
  y += 24

  // Tournament name
  ctx.font = `700 20px "Segoe UI", Arial, sans-serif`
  ctx.fillStyle = secondary
  ctx.fillText(data.tournamentName, cx, y, W - 160)
  y += 26

  // Game tag (pill shape)
  const gameText = data.game
  ctx.font = '600 12px "Segoe UI", Arial, sans-serif'
  const gameW = ctx.measureText(gameText).width + 32
  ctx.fillStyle = hexAlpha(primary, 0.18)
  ctx.strokeStyle = hexAlpha(primary, 0.4)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(cx - gameW / 2, y, gameW, 24, 12)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillText(gameText.toUpperCase(), cx, y + 16)
  y += 38

  // Date row (and prize if winner)
  const dateText = data.startDate + (data.endDate !== data.startDate ? ` – ${data.endDate}` : '')
  ctx.font = '10px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillText('TANGGAL', isWinner && data.prizePool ? cx - 70 : cx, y)
  ctx.font = '600 13px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.52)'
  ctx.fillText(dateText, isWinner && data.prizePool ? cx - 70 : cx, y + 18)

  if (isWinner && data.prizePool) {
    // Separator
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(cx + 10, y - 4, 1, 32)

    ctx.font = '10px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.textAlign = 'center'
    ctx.fillText('HADIAH', cx + 70, y)
    ctx.font = '700 13px "Segoe UI", Arial, sans-serif'
    ctx.fillStyle = '#F59E0B'
    ctx.fillText(data.prizePool, cx + 70, y + 18)
  }

  // ── 8. Watermark ──────────────────────────────────────────────────────────
  ctx.font = '10px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.textAlign = 'center'
  fillTextTracked(ctx, `SERTIFIKAT RESMI • ${organizer.toUpperCase()} • VERIFIED`, cx, H - 28, 3.5)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/** fillText with letter-spacing simulation */
function fillTextTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number
) {
  const totalW = ctx.measureText(text).width + tracking * (text.length - 1)
  let x = cx - totalW / 2
  for (const ch of text) {
    ctx.fillText(ch, x, y)
    x += ctx.measureText(ch).width + tracking
  }
}

// ─── React component ─────────────────────────────────────────────────────────

interface CertificateCanvasProps {
  data: CertificateData
  scale?: number
}

export interface CertificateCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null
}

export const CertificateCanvas = forwardRef<CertificateCanvasHandle, CertificateCanvasProps>(
  ({ data, scale = 1 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }))

    useEffect(() => {
      if (canvasRef.current) {
        drawCertificate(canvasRef.current, data)
      }
    }, [data])

    return (
      <canvas
        ref={canvasRef}
        width={CERT_W}
        height={CERT_H}
        style={{
          width: CERT_W * scale,
          height: CERT_H * scale,
          display: 'block',
          flexShrink: 0,
        }}
      />
    )
  }
)

CertificateCanvas.displayName = 'CertificateCanvas'

import Link from 'next/link'
import {
  Gamepad2,
  Trophy,
  Users,
  BarChart3,
  Newspaper,
  HelpCircle,
  Mail,
  ShieldCheck,
  FileText,
  MessageCircle,
  Instagram,
  Twitter,
  Youtube,
  Github,
  Send,
  MapPin,
  Phone,
  Swords,
  Star,
  Zap,
} from 'lucide-react'

const socialLinks = [
  {
    name: 'Discord',
    href: '#',
    icon: MessageCircle,
    color: 'hover:text-indigo-400 hover:bg-indigo-500/10',
  },
  {
    name: 'Instagram',
    href: '#',
    icon: Instagram,
    color: 'hover:text-pink-400 hover:bg-pink-500/10',
  },
  {
    name: 'Twitter / X',
    href: '#',
    icon: Twitter,
    color: 'hover:text-sky-400 hover:bg-sky-500/10',
  },
  {
    name: 'YouTube',
    href: '#',
    icon: Youtube,
    color: 'hover:text-red-400 hover:bg-red-500/10',
  },
  {
    name: 'Telegram',
    href: '#',
    icon: Send,
    color: 'hover:text-blue-400 hover:bg-blue-500/10',
  },
  {
    name: 'GitHub',
    href: '#',
    icon: Github,
    color: 'hover:text-gray-300 hover:bg-gray-500/10',
  },
]

const menuLinks = [
  { name: 'Turnamen', href: '/tournaments', icon: Trophy },
  { name: 'Tim', href: '/teams', icon: Users },
  { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
  { name: 'Berita', href: '/news', icon: Newspaper },
  { name: 'Pemain', href: '/players', icon: Swords },
]

const supportLinks = [
  { name: 'FAQ', href: '#', icon: HelpCircle },
  { name: 'Hubungi Kami', href: '#', icon: Mail },
  { name: 'Kebijakan Privasi', href: '#', icon: ShieldCheck },
  { name: 'Syarat & Ketentuan', href: '#', icon: FileText },
]

const features = [
  { icon: Zap, text: 'Pendaftaran Cepat & Mudah' },
  { icon: ShieldCheck, text: 'Sistem Verifikasi Admin' },
  { icon: Trophy, text: 'Bracket Otomatis' },
  { icon: Star, text: 'Leaderboard Real-Time' },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card">
      {/* Top highlight bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="container mx-auto px-4 py-14">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="p-1.5 bg-primary rounded-lg shadow-lg shadow-primary/30">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">GameArena</span>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform pendaftaran turnamen game online terbaik di Indonesia. Bergabunglah bersama ribuan gamer kompetitif dan buktikan keahlianmu!
            </p>

            {/* Feature badges */}
            <ul className="space-y-2">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Jakarta, Indonesia</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>hello@gamearena.id</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Menu
            </h4>
            <ul className="space-y-2.5">
              {menuLinks.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Dukungan
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Ikuti Kami
            </h4>

            {/* Social icon grid */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {socialLinks.map(({ name, href, icon: Icon, color }) => (
                <Link
                  key={name}
                  href={href}
                  title={name}
                  className={`flex items-center justify-center rounded-lg p-2.5 border border-border/50 text-muted-foreground transition-all duration-200 ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>

            {/* Newsletter mini */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Newsletter</p>
              <p className="text-xs text-muted-foreground">Dapatkan info turnamen terbaru langsung di inbox kamu.</p>
              <div className="flex gap-2 mt-2">
                <input
                  type="email"
                  placeholder="Email kamu..."
                  className="flex-1 text-xs px-3 py-2 rounded-md bg-background border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GameArena. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Gamepad2 className="h-3.5 w-3.5 text-primary" />
            <span>Dibuat dengan semangat gaming 🎮</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">Privasi</Link>
            <Link href="#" className="hover:text-primary transition-colors">Ketentuan</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

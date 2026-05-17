import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import { PaymentSettingsEditor } from '@/components/admin/payment-settings-editor'
import { CreditCard } from 'lucide-react'

export default async function AdminPaymentSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Load existing settings
  const { data: settings } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('id', 1)
    .single()

  const initial = {
    bank_accounts: settings?.bank_accounts ?? [],
    qris_image_url: settings?.qris_image_url ?? null,
    payment_instructions: settings?.payment_instructions ?? null,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="hidden md:flex sticky top-0 z-30 h-14 items-center border-b border-border/60 bg-background/80 backdrop-blur px-6">
          <span className="text-sm font-medium text-foreground">Pengaturan Pembayaran</span>
        </header>

        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6 space-y-6 max-w-3xl">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Pengaturan Pembayaran</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-0.5">
              Atur metode pembayaran yang akan ditampilkan kepada peserta saat mendaftar turnamen.
            </p>
          </div>

          <PaymentSettingsEditor initial={initial} />
        </main>
      </div>
    </div>
  )
}

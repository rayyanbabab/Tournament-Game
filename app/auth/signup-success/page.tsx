import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gamepad2, Mail, CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-xl">
              <Gamepad2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">GameArena</span>
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Pendaftaran Berhasil!</CardTitle>
            <CardDescription>
              Akun Anda telah dibuat dengan sukses
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 p-4 bg-secondary rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <p className="text-sm text-foreground">
                Silakan cek email Anda untuk verifikasi akun
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Klik link yang dikirim ke email Anda untuk mengaktifkan akun dan mulai bergabung dalam turnamen.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Kembali ke Halaman Login
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                Kembali ke Beranda
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

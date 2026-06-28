import { Rocket, ShieldCheck } from 'lucide-react'
import logo from '@/assets/bravic-logo.png'
import { LoginForm } from '../components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-black/5 md:min-h-[40rem] md:grid-cols-2">
        {/* ── Panel de marca (azul degradado) ── */}
        <div className="bg-brand-gradient relative hidden flex-col justify-between overflow-hidden p-10 text-white md:flex">
          {/* brillos suaves */}
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/4 size-64 rounded-full bg-accent/30 blur-3xl" />

          <span className="relative text-sm font-medium uppercase tracking-[0.2em] text-white/80">
            Bienvenido a
          </span>

          <div className="relative flex flex-col items-center gap-4 text-center">
            <span className="flex size-24 items-center justify-center rounded-full bg-white shadow-xl">
              <img src={logo} alt="Bravic Systems" className="size-14 object-contain" />
            </span>
            <h2 className="text-3xl font-bold tracking-wide">BRAVIC SYSTEMS</h2>
            <p className="max-w-xs text-sm leading-relaxed text-white/75">
              Gestiona toda tu operación en un solo lugar: empresas, usuarios y el
              acceso a cada sistema de la plataforma.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="size-4" />
            Acceso seguro · © {new Date().getFullYear()} Bravic Systems
          </div>

          {/* Divisor ondulado tipo "nube" hacia el panel blanco */}
          <Wave />
        </div>

        {/* ── Panel de formulario ── */}
        <div className="flex flex-col justify-center gap-7 p-8 sm:p-12">
          {/* Logo compacto solo en mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary">
              <Rocket className="size-5 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-wide">BRAVIC SYSTEMS</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground">Inicia sesión</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder a tu panel.
            </p>
          </div>

          <LoginForm showCompany={false} />

          <p className="text-center text-xs text-muted-foreground">
            ¿Problemas para entrar?{' '}
            <span className="font-medium text-foreground">Contacta a soporte</span>
          </p>
        </div>
      </div>
    </div>
  )
}

/** Divisor ondulado (nubes) que conecta el panel azul con el formulario, como en el diseño. */
function Wave() {
  return (
    <svg
      className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-24 translate-x-px text-card md:block"
      viewBox="0 0 100 600"
      preserveAspectRatio="none"
      fill="currentColor"
      aria-hidden
    >
      <path
        opacity="0.4"
        d="M100 0 C 55 70, 75 150, 45 230 C 15 310, 70 390, 40 470 C 10 540, 60 580, 100 600 Z"
      />
      <path
        opacity="0.7"
        d="M100 0 C 70 80, 85 160, 60 240 C 35 320, 80 400, 55 480 C 30 550, 75 585, 100 600 Z"
      />
      <path d="M100 0 C 85 90, 95 170, 78 250 C 60 330, 92 410, 75 490 C 58 560, 88 590, 100 600 Z" />
    </svg>
  )
}

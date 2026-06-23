import { Boxes, ShieldCheck, ShoppingCart, Truck, Users } from 'lucide-react'
import logo from '@/assets/bravic-logo.png'
import { LoginForm } from '../components/LoginForm'

const MODULES = [
  { icon: Boxes, label: 'ERP' },
  { icon: ShoppingCart, label: 'POS' },
  { icon: Truck, label: 'TMS' },
  { icon: Users, label: 'HR' },
]

export default function LoginPage() {
  return (
    <div
      className="relative flex min-h-svh items-center justify-center overflow-hidden p-4"
      style={{
        backgroundColor: '#0a0a0b',
        backgroundImage: `
          radial-gradient(55rem 55rem at 18% 18%, rgba(255, 255, 255, 0.10), transparent 60%),
          radial-gradient(50rem 50rem at 85% 85%, rgba(160, 160, 168, 0.12), transparent 60%),
          linear-gradient(135deg, #0a0a0b 0%, #1c1c1f 100%)
        `,
      }}
    >
      {/* Fondo decorativo: orbes difuminados + patrón de puntos */}
      <div className="pointer-events-none absolute -left-32 -top-32 size-[32rem] rounded-full bg-white/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[34rem] rounded-full bg-zinc-400/10 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(ellipse at center, black 15%, transparent 70%)',
        }}
      />

      {/* Tarjeta glass */}
      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-card/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl md:min-h-[38rem] md:grid-cols-2">
        {/* Panel de marca (solo md+) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground md:flex">
          {/* brillo interior */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary-foreground/10 blur-2xl" />

          <div className="relative flex items-center gap-3">
            <span className="inline-flex items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <img src={logo} alt="Bravic Systems" className="size-11 object-contain" />
            </span>
            <span className="text-lg font-semibold tracking-wide">BRAVIC SYSTEMS</span>
          </div>

          <div className="relative space-y-4">
            <h2 className="text-3xl font-bold leading-tight">
              Gestiona toda tu operación en un solo lugar
            </h2>
            <p className="max-w-sm text-sm text-primary-foreground/70">
              Panel del propietario. Administra empresas, usuarios y el acceso a cada
              sistema de la plataforma.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {MODULES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium ring-1 ring-primary-foreground/15"
                >
                  <Icon className="size-3.5" /> {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-primary-foreground/60">
            <ShieldCheck className="size-4" /> Acceso seguro · © {new Date().getFullYear()} Bravic Systems
          </div>
        </div>

        {/* Panel de formulario */}
        <div className="flex flex-col justify-center gap-7 p-8 sm:p-10">
          {/* Logo compacto solo en mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <img src={logo} alt="Bravic Systems" className="size-10 object-contain" />
            <span className="font-semibold tracking-wide">BRAVIC SYSTEMS</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold">Bienvenido de nuevo 👋</h1>
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

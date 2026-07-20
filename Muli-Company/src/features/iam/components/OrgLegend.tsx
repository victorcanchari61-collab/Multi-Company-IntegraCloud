export function OrgLegend() {
  return (
    <div className="flex items-center gap-6 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span className="inline-block size-3 rounded border border-amber-600/40 bg-white" />
        <span>ROL ESTÁNDAR</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block size-3 rounded bg-amber-500" />
        <span>ROL DESTACADO</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-block h-px w-6 bg-amber-500" />
        <span>RELACIÓN JERÁRQUICA</span>
      </div>
    </div>
  )
}

import { useRef, useEffect, useState, useCallback } from 'react'
import { OrgNode } from './OrgNode'
import type { RoleTreeDto } from '../types/iam'

interface OrgChartProps {
  roles: RoleTreeDto[]
}

type ConnectorLine = { x1: number; y1: number; x2: number; y2: number }

export function OrgChart({ roles }: OrgChartProps) {
  return (
    <div className="flex justify-center overflow-x-auto py-8">
      {roles.length === 1 ? (
        <OrgTreeNode role={roles[0]} />
      ) : (
        <div className="flex justify-center gap-12">
          {roles.map((role) => (
            <OrgTreeNode key={role.id} role={role} />
          ))}
        </div>
      )}
    </div>
  )
}

function OrgTreeNode({ role }: { role: RoleTreeDto }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const childrenRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<ConnectorLine[]>([])
  const hasChildren = role.children.length > 0
  const isHighlighted = !role.parentRoleId

  const updateLines = useCallback(() => {
    if (!hasChildren) { setLines([]); return }
    const container = containerRef.current
    const parent = parentRef.current
    const childrenContainer = childrenRef.current
    if (!container || !parent || !childrenContainer) return

    const containerRect = container.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()

    const parentBottomX = parentRect.left - containerRect.left + parentRect.width / 2
    const parentBottomY = parentRect.bottom - containerRect.top

    const childNodes = childrenContainer.querySelectorAll<HTMLElement>('[data-org-node]')
    if (childNodes.length === 0) { setLines([]); return }

    const childCenters: { x: number; y: number }[] = []
    childNodes.forEach((child) => {
      const childRect = child.getBoundingClientRect()
      childCenters.push({
        x: childRect.left - containerRect.left + childRect.width / 2,
        y: childRect.top - containerRect.top,
      })
    })

    const VERTICAL_GAP = 40
    const midY = parentBottomY + VERTICAL_GAP
    const minChildX = Math.min(...childCenters.map((c) => c.x))
    const maxChildX = Math.max(...childCenters.map((c) => c.x))

    const newLines: ConnectorLine[] = []

    newLines.push({ x1: parentBottomX, y1: parentBottomY, x2: parentBottomX, y2: midY })

    if (childCenters.length === 1) {
      newLines.push({ x1: parentBottomX, y1: midY, x2: childCenters[0].x, y2: midY })
    } else {
      newLines.push({ x1: minChildX, y1: midY, x2: maxChildX, y2: midY })
      newLines.push({ x1: parentBottomX, y1: midY, x2: parentBottomX, y2: midY })
    }

    childCenters.forEach((child) => {
      newLines.push({ x1: child.x, y1: midY, x2: child.x, y2: child.y })
    })

    setLines(newLines)
  }, [hasChildren])

  useEffect(() => {
    updateLines()
    if (!containerRef.current) return
    const observer = new ResizeObserver(updateLines)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [updateLines])

  return (
    <div ref={containerRef} className="relative flex flex-col items-center">
      <div ref={parentRef}>
        <OrgNode
          name={role.name}
          isHighlighted={isHighlighted}
        />
      </div>

      {hasChildren && (
        <>
          <svg
            className="pointer-events-none absolute size-full"
            style={{ top: 0, left: 0, zIndex: 0 }}
          >
            {lines.map((line, i) => (
              <line
                key={i}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#d97706"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
          </svg>

          <div
            ref={childrenRef}
            className="mt-14 flex justify-center gap-8"
            style={{ zIndex: 1 }}
          >
            {role.children.map((child) => (
              <OrgTreeNode key={child.id} role={child} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

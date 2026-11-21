import { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, useLayoutEffect, useRef, useState } from "react"
import { Tile } from "../lib/lesson_gen"
import "./tile_picker.css"

interface Props {
  tiles: Tile[]
  placed: string[] // ids of the tiles in the answer, in order
  onChange: (placed: string[]) => void
  renderLabel?: (tile: Tile) => ReactNode
  onPlace?: (tile: Tile) => void // a tile has gone into the answer
  disabled?: boolean
  wide?: boolean // the tiles hold long labels, so fewer to a row
}

interface Drag {
  id: string
  from: "pool" | "answer"
  pointerId: number
  startX: number
  startY: number
  x: number
  y: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  moved: boolean
  insertAt?: number // where it would go in the answer, if dropped now; undefined outside it
}

const DRAG_START = 6 // px moved before a press becomes a drag

// TilePicker is an answer area above a pool of tiles. Tiles go into the answer by
// tapping them or by dragging them to the place they should go, and come back out the
// same ways; tiles in the answer can be dragged into a different order.
export function TilePicker({ tiles, placed, onChange, renderLabel, onPlace, disabled, wide }: Props): JSX.Element {
  const [drag, setDrag] = useState<Drag>()
  const answerRef = useRef<HTMLDivElement>(null)
  const label = (tile: Tile) => renderLabel ? renderLabel(tile) : tile.label
  const byId = new Map(tiles.map(t => [t.id, t]))

  const toggle = (id: string) => {
    if (placed.includes(id)) {
      onChange(placed.filter(p => p != id))
    } else {
      onChange([...placed, id])
      onPlace?.(byId.get(id)!)
    }
  }

  // insertionPoint works out where among the answer's tiles a tile dropped at (x, y)
  // would land, or undefined if (x, y) is outside the answer area
  const insertionPoint = (x: number, y: number, dragging: string): number | undefined => {
    const area = answerRef.current
    if (area == undefined) {
      return undefined
    }
    const box = area.getBoundingClientRect()
    const slack = 24
    if (x < box.left - slack || x > box.right + slack || y < box.top - slack || y > box.bottom + slack) {
      return undefined
    }
    let at = 0
    for (const el of Array.from(area.querySelectorAll<HTMLElement>("[data-tile]"))) {
      if (el.dataset.tile == dragging) {
        continue
      }
      const r = el.getBoundingClientRect()
      if (y < r.top || (y <= r.bottom && x < r.left + r.width / 2)) {
        break
      }
      at++
    }
    return at
  }

  // the latest of everything, for the window listeners below
  const latest = useRef({ drag, placed, onChange, onPlace, toggle, insertionPoint, byId })
  latest.current = { drag, placed, onChange, onPlace, toggle, insertionPoint, byId }

  // while a tile is held, follow the pointer anywhere on the page. The listeners are on
  // the window because the tile pressed can be re-drawn elsewhere as it moves.
  const dragPointer = drag?.pointerId
  useLayoutEffect(() => {
    if (dragPointer == undefined) {
      return
    }
    const onMove = (e: PointerEvent) => {
      const { drag, insertionPoint } = latest.current
      if (drag == undefined || e.pointerId != drag.pointerId) {
        return
      }
      const moved = drag.moved || Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > DRAG_START
      if (moved) {
        e.preventDefault()
      }
      setDrag({
        ...drag, x: e.clientX, y: e.clientY, moved,
        insertAt: moved ? insertionPoint(e.clientX, e.clientY, drag.id) : undefined,
      })
    }
    const onUp = (e: PointerEvent) => {
      const { drag, placed, onChange, onPlace, toggle, byId } = latest.current
      if (drag == undefined || e.pointerId != drag.pointerId) {
        return
      }
      setDrag(undefined)
      if (!drag.moved) {
        toggle(drag.id)
        return
      }
      const rest = placed.filter(p => p != drag.id)
      if (drag.insertAt != undefined) {
        const at = Math.min(drag.insertAt, rest.length)
        onChange([...rest.slice(0, at), drag.id, ...rest.slice(at)])
        if (drag.from == "pool") {
          onPlace?.(byId.get(drag.id)!)
        }
      } else if (drag.from == "answer") {
        // dragged out of the answer: back to the pool
        onChange(rest)
      }
    }
    const onCancel = () => setDrag(undefined)
    window.addEventListener("pointermove", onMove, { passive: false })
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onCancel)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
    }
  }, [dragPointer])

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>, id: string, from: Drag["from"]) => {
    if (disabled || e.button != 0 || drag != undefined) {
      return
    }
    const r = e.currentTarget.getBoundingClientRect()
    setDrag({
      id, from, pointerId: e.pointerId,
      startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY,
      offsetX: e.clientX - r.left, offsetY: e.clientY - r.top, width: r.width, height: r.height,
      moved: false,
    })
  }

  const tileProps = (id: string, from: Drag["from"]) => ({
    type: "button" as const,
    disabled,
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => onPointerDown(e, id, from),
    // a keyboard press (no pointer) toggles the tile; pointer taps are handled above
    onClick: (e: ReactMouseEvent) => {
      if (e.detail == 0) {
        toggle(id)
      }
    },
  })

  const dragging = drag?.moved ? drag : undefined
  const answerTiles = placed.filter(id => !(dragging && dragging.id == id))
  const answerItems: ReactNode[] = answerTiles.map(id => (
    <button key={id} className="tile" data-tile={id} {...tileProps(id, "answer")}>
      {label(byId.get(id)!)}
    </button>
  ))
  if (dragging?.insertAt != undefined) {
    answerItems.splice(Math.min(dragging.insertAt, answerItems.length), 0, (
      <span key="placeholder" className="tile tilePlaceholder" style={{ width: dragging.width }} />
    ))
  }

  return (
    <div className={`tilePicker${wide ? " wide" : ""}${dragging ? " dragging" : ""}`}>
      <div ref={answerRef} className={`tileAnswer${dragging?.insertAt != undefined ? " over" : ""}`}>
        {answerItems.length == 0 && <span className="tileAnswerHint">Tap or drag tiles here</span>}
        {answerItems}
      </div>

      <div className="tilePool">
        {tiles.map(tile => {
          const used = placed.includes(tile.id) || dragging?.id == tile.id
          return used
            ? <span key={tile.id} className="tile tileSlot">{label(tile)}</span>
            : (
              <button key={tile.id} className="tile" {...tileProps(tile.id, "pool")}>
                {label(tile)}
              </button>
            )
        })}
      </div>

      {dragging && (
        <span
          className="tile tileFloating"
          style={{
            left: dragging.x - dragging.offsetX,
            top: dragging.y - dragging.offsetY,
            width: dragging.width,
            height: dragging.height,
          }}
        >
          {label(byId.get(dragging.id)!)}
        </span>
      )}
    </div>
  )
}

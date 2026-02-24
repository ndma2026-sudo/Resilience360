import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import Globe from 'react-globe.gl'

type GlobalEarthquake = {
  id: string
  magnitude: number
  place: string
  time: string
  depthKm: number
  lat: number
  lng: number
  url: string
}

type GlobePoint = {
  id: string
  lat: number
  lng: number
  altitude: number
  radius: number
  color: string
  label: string
}

type GlobalEarthquakeGlobeProps = {
  earthquakes: GlobalEarthquake[]
  selectedEarthquakeId?: string | null
  onSelectEarthquake?: (id: string) => void
  onRefreshEarthquakes?: () => void
  isRefreshing?: boolean
  focusToken?: number
}

function severityColor(magnitude: number): string {
  if (magnitude >= 6) return '#b91c1c'
  if (magnitude >= 5) return '#ea580c'
  if (magnitude >= 4) return '#ca8a04'
  return '#2563eb'
}

function formatLabel(quake: GlobalEarthquake): string {
  return [
    `<strong>M ${quake.magnitude.toFixed(1)}</strong>`,
    quake.place,
    `Depth: ${quake.depthKm.toFixed(1)} km`,
    new Date(quake.time).toLocaleString(),
  ].join('<br/>')
}

export default function GlobalEarthquakeGlobe({
  earthquakes,
  selectedEarthquakeId,
  onSelectEarthquake,
  onRefreshEarthquakes,
  isRefreshing = false,
  focusToken = 0,
}: GlobalEarthquakeGlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const tableRef = useRef<HTMLDivElement | null>(null)
  const globeRef = useRef<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [size, setSize] = useState({ width: 920, height: 420 })
  const [isBlinkOn, setIsBlinkOn] = useState(true)
  const [tablePosition, setTablePosition] = useState({ x: 12, y: 56 })
  const [isDraggingTable, setIsDraggingTable] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const selectedEarthquake = useMemo(
    () => earthquakes.find((quake) => quake.id === selectedEarthquakeId) ?? null,
    [earthquakes, selectedEarthquakeId],
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const width = Math.max(320, Math.floor(container.clientWidth))
      const height = Math.max(320, Math.floor(Math.min(560, width * 0.55)))
      setSize({ width, height })

      const tableEl = tableRef.current
      if (tableEl) {
        const maxX = Math.max(8, width - tableEl.offsetWidth - 8)
        const maxY = Math.max(44, height - tableEl.offsetHeight - 8)
        setTablePosition((prev) => ({
          x: Math.max(8, Math.min(prev.x, maxX)),
          y: Math.max(44, Math.min(prev.y, maxY)),
        }))
      }
    }

    updateSize()

    const observer = new ResizeObserver(() => updateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement
      setIsFullscreen(Boolean(fullscreenElement && containerRef.current && fullscreenElement.contains(containerRef.current)))
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    if (!globeRef.current) return

    if (earthquakes.length === 0) {
      globeRef.current.pointOfView({ lat: 20, lng: 15, altitude: 2.3 }, 700)
      return
    }

    const target = selectedEarthquake ?? earthquakes[0]
    globeRef.current.pointOfView(
      {
        lat: target.lat,
        lng: target.lng,
        altitude: selectedEarthquake ? 1.05 : 1.7,
      },
      900,
    )
  }, [earthquakes, selectedEarthquake, focusToken])

  useEffect(() => {
    if (!selectedEarthquake) return

    const timer = window.setInterval(() => {
      setIsBlinkOn((value) => !value)
    }, 420)

    return () => window.clearInterval(timer)
  }, [selectedEarthquake])

  useEffect(() => {
    if (!isDraggingTable) return

    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current
      const table = tableRef.current
      if (!container || !table) return

      const rect = container.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      const nextX = event.clientX - rect.left - dragOffsetRef.current.x
      const nextY = event.clientY - rect.top - dragOffsetRef.current.y
      const maxX = Math.max(8, width - table.offsetWidth - 8)
      const maxY = Math.max(44, height - table.offsetHeight - 8)

      setTablePosition({
        x: Math.max(8, Math.min(nextX, maxX)),
        y: Math.max(44, Math.min(nextY, maxY)),
      })
    }

    const handleMouseUp = () => {
      setIsDraggingTable(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDraggingTable])

  const pointsData = useMemo<GlobePoint[]>(() => {
    return earthquakes.map((quake) => {
      const magnitude = Number.isFinite(quake.magnitude) ? quake.magnitude : 0
      return {
        id: quake.id,
        lat: quake.lat,
        lng: quake.lng,
        altitude: Math.max(0.01, Math.min(0.22, 0.02 + magnitude * 0.02)),
        radius: Math.max(0.08, Math.min(0.28, 0.08 + magnitude * 0.028)),
        color: severityColor(magnitude),
        label: formatLabel(quake),
      }
    })
  }, [earthquakes])

  const selectedPointData = useMemo<GlobePoint[]>(() => {
    if (!selectedEarthquake) return []

    return [
      {
        id: `selected-${selectedEarthquake.id}`,
        lat: selectedEarthquake.lat,
        lng: selectedEarthquake.lng,
        altitude: 0.24,
        radius: 0.42,
        color: isBlinkOn ? '#ff1f1f' : '#7f1d1d',
        label: `⚠️ <strong>Selected Earthquake</strong><br/>${formatLabel(selectedEarthquake)}`,
      },
    ]
  }, [isBlinkOn, selectedEarthquake])

  const ringData = useMemo(() => {
    if (!selectedEarthquake) return []
    return [selectedEarthquake]
  }, [selectedEarthquake])

  const handleToggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await container.requestFullscreen()
  }

  const handleTableDragStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    dragOffsetRef.current = {
      x: event.clientX - rect.left - tablePosition.x,
      y: event.clientY - rect.top - tablePosition.y,
    }
    setIsDraggingTable(true)
  }

  return (
    <div ref={containerRef} className={`earthquake-globe-wrap${isFullscreen ? ' earthquake-globe-wrap-fullscreen' : ''}`}>
      <div className="earthquake-globe-head">
        <h4>🌐 Live Earthquake Globe</h4>
        <button onClick={handleToggleFullscreen}>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>
      </div>

      <div
        ref={tableRef}
        className={`earthquake-floating-table${isDraggingTable ? ' dragging' : ''}`}
        style={{ left: `${tablePosition.x}px`, top: `${tablePosition.y}px` }}
      >
        <div className="earthquake-floating-table-head" onMouseDown={handleTableDragStart}>
          <span>Live Data Table</span>
          <button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={() => onRefreshEarthquakes?.()}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
        </div>
        <div className="earthquake-floating-table-body">
          {earthquakes.length === 0 && <p className="earthquake-floating-empty">No global earthquakes available right now.</p>}
          {earthquakes.length > 0 && (
            <table className="earthquake-floating-grid">
              <thead>
                <tr>
                  <th>Mag</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>D</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {earthquakes.slice(0, 20).map((quake) => {
                  const magnitudeClass =
                    quake.magnitude >= 6
                      ? 'quake-entry-tier-veryhigh'
                      : quake.magnitude >= 5
                        ? 'quake-entry-tier-high'
                        : quake.magnitude >= 4
                          ? 'quake-entry-tier-medium'
                          : 'quake-entry-tier-low'

                  return (
                    <tr
                      key={quake.id}
                      className={`quake-entry-button ${magnitudeClass} ${selectedEarthquakeId === quake.id ? 'selected' : ''}`}
                      onClick={() => onSelectEarthquake?.(quake.id)}
                    >
                      <td>
                        <strong>M {quake.magnitude.toFixed(1)}</strong>
                      </td>
                      <td>{quake.place}</td>
                      <td>{new Date(quake.time).toLocaleString()}</td>
                      <td>{quake.depthKm.toFixed(1)}</td>
                      <td>
                        <a href={quake.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                          Details
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="earthquake-globe-stage">
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#6aa4ff"
          atmosphereAltitude={0.18}
          pointsData={[...pointsData, ...selectedPointData]}
          pointLat="lat"
          pointLng="lng"
          pointAltitude="altitude"
          pointRadius="radius"
          pointColor="color"
          pointLabel="label"
          onPointClick={(point: { id?: string }) => {
            const pointId = String(point?.id ?? '')
            if (!pointId) return
            const normalizedId = pointId.startsWith('selected-') ? pointId.replace('selected-', '') : pointId
            if (onSelectEarthquake) onSelectEarthquake(normalizedId)
          }}
          ringsData={ringData}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => (isBlinkOn ? '#ff2626' : '#b91c1c')}
          ringMaxRadius={3.6}
          ringPropagationSpeed={2.5}
          ringRepeatPeriod={700}
        />
      </div>
    </div>
  )
}

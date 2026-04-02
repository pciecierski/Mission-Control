import { useEffect, useState, useCallback } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Paper,
  Stack,
  Chip,
  Divider,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  GlobalStyles,
  Link,
} from '@mui/material'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PrintIcon from '@mui/icons-material/Print'

const sortByStart = (arr) =>
  [...arr].sort((a, b) => {
    const aDate = new Date(`${a.planowanaData}T${a.godzinaRozpoczecia || '00:00'}`)
    const bDate = new Date(`${b.planowanaData}T${b.godzinaRozpoczecia || '00:00'}`)
    return aDate - bDate
  })

const mapFromApi = (item) => ({
  id: String(item.id),
  numerAwizacji: item.numer_awizacji,
  rodzaj: item.rodzaj,
  magazyn: item.magazyn,
  kierowca: item.kierowca,
  numerPojazdu: item.numer_pojazdu,
  planowanaData: item.planowana_data,
  planowanaGodzina: item.planowana_godzina,
  godzinaRozpoczecia: item.godzina_rozpoczecia,
  iloscZamowien: item.ilosc_zamowien,
  status: item.status ?? 'Oczekujący',
  orders: item.orders ?? [],
})

function Tile({ awizacja, isDragging, expanded, onToggle, onDelete, onPrint, isQueue, docUrl }) {
  const canPrint = Boolean(onPrint)
  const bgColor =
    awizacja.status === 'Realizowane'
      ? '#e6f4ea'
      : awizacja.status === 'Zakończone'
        ? '#f2f2f2'
        : isDragging
          ? 'action.hover'
          : 'background.paper'
  return (
    <Paper
      elevation={isDragging ? 3 : 1}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: isDragging ? 'primary.main' : 'divider',
        backgroundColor: bgColor,
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
      }}
    >
      <Stack spacing={1} onClick={onToggle} sx={{ cursor: 'pointer' }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography fontWeight={700}>{awizacja.numerAwizacji}</Typography>
          <Chip
            label={awizacja.rodzaj === 'rozładunek' ? 'Rozładunek' : 'Załadunek'}
            color={awizacja.rodzaj === 'rozładunek' ? 'primary' : 'secondary'}
            size="small"
          />
          <Chip label={awizacja.magazyn} size="small" />
          <Chip label={awizacja.status ?? 'Oczekujący'} size="small" />
          {expanded && (
            <Box sx={{ ml: 'auto' }}>
              {!isQueue && (
                <IconButton
                  color="error"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.()
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              )}
              {canPrint && (
                <IconButton
                  color="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPrint?.()
                  }}
                >
                  <PrintIcon />
                </IconButton>
              )}
            </Box>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Kierowca: <strong>{awizacja.kierowca}</strong> | Pojazd: {awizacja.numerPojazdu}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Plan: {awizacja.planowanaData} • {awizacja.planowanaGodzina} • Start:{' '}
          {awizacja.godzinaRozpoczecia} • Zamówień: {awizacja.iloscZamowien}
        </Typography>
        {expanded && (
          <Stack spacing={0.5} sx={{ pt: 1 }}>
            <Typography variant="body2">
              Status: <strong>{awizacja.status ?? 'Oczekujący'}</strong>
            </Typography>
            {awizacja.orders?.length ? (
              <Stack spacing={0.5}>
                {awizacja.orders.map((o, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary">
                    • {o.strefa} | {o.grupa_towarowa} | {o.dostawca} | Nośniki: {o.ilosc_nosnikow} | Ref.:{' '}
                    {o.ilosc_referencji}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Brak zamówień.
              </Typography>
            )}
            {docUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', pt: 1 }}>
                <Link
                  href={docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  variant="button"
                  sx={{ fontWeight: 600 }}
                >
                  docurl
                </Link>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}

function Column({
  title,
  droppableId,
  items,
  expandedId,
  onToggle,
  onDelete,
  onPrint,
  isDropDisabled = false,
}) {
  const isQueue = droppableId === 'queue'
  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Typography variant="h6" fontWeight={800}>
        {title} <Chip label={items.length} size="small" sx={{ ml: 1 }} />
      </Typography>
      <Divider />
      <Droppable droppableId={droppableId} isDropDisabled={isDropDisabled}>
        {(provided, snapshot) => (
          <Stack
            ref={provided.innerRef}
            {...provided.droppableProps}
            spacing={1.5}
            sx={{
              minHeight: '60vh',
              p: 1,
              border: '1px dashed',
              borderColor: snapshot.isDraggingOver ? 'primary.main' : 'divider',
              borderRadius: 2,
              backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
              transition: 'border-color 120ms ease, background-color 120ms ease',
            }}
          >
            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                Nic tutaj nie ma. Przeciągnij kafel z lewej/prawej.
              </Typography>
            ) : (
              items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={String(item.id)}
                  index={index}
                  isDragDisabled={item.isDragDisabled}
                >
                  {(dragProvided, dragSnapshot) => (
                    <Box
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                    >
                      <Tile
                        awizacja={item}
                        isDragging={dragSnapshot.isDragging}
                        expanded={expandedId === item.id}
                        onToggle={() => onToggle?.(item.id)}
                        onDelete={() => onDelete?.(item.id)}
                        onPrint={() => onPrint?.(item)}
                        isQueue={isQueue}
                        docUrl={item.docUrl}
                      />
                    </Box>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </Stack>
        )}
      </Droppable>
    </Stack>
  )
}

function App() {
  const [pool, setPool] = useState([])
  const [queue, setQueue] = useState([])
  const [inProgress, setInProgress] = useState([])
  const [done, setDone] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [dialogItem, setDialogItem] = useState(null)
  const [isWorkerMode, setIsWorkerMode] = useState(false)
  const [confirmModeOpen, setConfirmModeOpen] = useState(false)
  const [creatingLink, setCreatingLink] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [linksCache, setLinksCache] = useState({})
  const [docUrlByAwizacja, setDocUrlByAwizacja] = useState({})

  const API_BASE = import.meta.env.VITE_API_BASE ?? ''
  const statusByColumn = {
    pool: 'Oczekujący',
    queue: 'Zakolejkowany',
    inProgress: 'Realizowane',
    done: 'Zakończone',
  }

  const reorderQueueOnServer = async (orderedIds) => {
    if (!orderedIds.length) return
    const res = await fetch(`${API_BASE}/api/queue/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ order: orderedIds.map((id) => Number(id)) }),
    })
    if (!res.ok) throw new Error(`Reorder failed (${res.status})`)
    return res.json()
  }

  const patchStatus = async (id, status) => {
    const res = await fetch(`${API_BASE}/api/queue/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error(`PATCH status failed (${res.status})`)
    return res.json().catch(() => ({}))
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/queue`, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`Błąd API: ${res.status}`)
      const data = await res.json().catch(() => null)
      if (!data) throw new Error('Błąd parsowania odpowiedzi API')
      const normalized = (data || []).map(mapFromApi)
      const poolItems = normalized.filter(
        (i) => !['Zakolejkowany', 'Realizowane', 'Zakończone'].includes(i.status)
      )
      const queueItems = normalized.filter((i) => i.status === 'Zakolejkowany')
      const inProgressItems = normalized.filter((i) => i.status === 'Realizowane')
      const doneItems = normalized.filter((i) => i.status === 'Zakończone')
      setPool(sortByStart(poolItems))
      setQueue(queueItems)
      setInProgress(sortByStart(inProgressItems))
      setDone(sortByStart(doneItems))
    } catch (err) {
      setError(err.message || 'Błąd ładowania')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDragEnd = async (result) => {
    if (isWorkerMode) return
    const { source, destination } = result
    if (!destination) return

    // Drag & drop działa tylko między pool a queue
    const allowed = new Set(['pool', 'queue'])
    if (!allowed.has(source.droppableId) || !allowed.has(destination.droppableId)) return

    const prevPool = [...pool]
    const prevQueue = [...queue]

    // Reorder within queue
    if (source.droppableId === 'queue' && destination.droppableId === 'queue') {
      if (source.index === destination.index) return
      const reordered = Array.from(queue)
      const [moved] = reordered.splice(source.index, 1)
      reordered.splice(destination.index, 0, moved)
      setQueue(reordered)
      try {
        await reorderQueueOnServer(reordered.map((i) => i.id))
      } catch (err) {
        setError(err.message || 'Nie udało się zmienić kolejności')
        setQueue(prevQueue)
      }
      return
    }

    // Move pool -> queue
    if (source.droppableId === 'pool' && destination.droppableId === 'queue') {
      const sourceItems = Array.from(pool)
      const [moved] = sourceItems.splice(source.index, 1)
      const destItems = [...queue]
      moved.status = 'Zakolejkowany'
      destItems.splice(destination.index, 0, moved)
      setPool(sortByStart(sourceItems))
      setQueue(destItems)
      try {
        await patchStatus(moved.id, 'Zakolejkowany')
        await reorderQueueOnServer(destItems.map((i) => i.id))
      } catch (err) {
        setError(err.message || 'Nie udało się zmienić statusu')
        setPool(prevPool)
        setQueue(prevQueue)
      }
      return
    }

    // Move queue -> pool
    if (source.droppableId === 'queue' && destination.droppableId === 'pool') {
      const sourceItems = Array.from(queue)
      const [moved] = sourceItems.splice(source.index, 1)
      moved.status = 'Oczekujący'
      const destItems = sortByStart([...pool, moved])
      setQueue(sourceItems)
      setPool(destItems)
      try {
        await patchStatus(moved.id, 'Oczekujący')
        await reorderQueueOnServer(sourceItems.map((i) => i.id))
      } catch (err) {
        setError(err.message || 'Nie udało się zmienić statusu')
        setQueue(prevQueue)
        setPool(prevPool)
      }
      return
    }
  }

  const handleDelete = async (id) => {
    if (isWorkerMode) return
    try {
      await fetch(`${API_BASE}/api/queue/${id}`, { method: 'DELETE' })
      setPool((prev) => prev.filter((i) => i.id !== id))
      setQueue((prev) => prev.filter((i) => i.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      console.error('Delete error', err)
    }
  }

  const toggleMode = () => {
    if (isWorkerMode) {
      setConfirmModeOpen(true)
      return
    }
    setIsWorkerMode(true)
    setExpandedId(null)
  }

  const confirmLeaderMode = () => {
    setIsWorkerMode(false)
    setConfirmModeOpen(false)
    setExpandedId(null)
  }

  useEffect(() => {
    if (!dialogItem?.numerAwizacji) {
      setQrCodeUrl('')
      return
    }
    const cached = linksCache[dialogItem.numerAwizacji]
    setQrCodeUrl(cached || '')
  }, [dialogItem, linksCache])

  const handleCreateLink = async () => {
    if (!dialogItem?.numerAwizacji) return
    if (linksCache[dialogItem.numerAwizacji] || docUrlByAwizacja[dialogItem.numerAwizacji]) {
      window.alert('Link już utworzony dla tego obiektu.')
      return
    }
    try {
      setCreatingLink(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/links/proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ sourceDocumentNumber: dialogItem.numerAwizacji }),
      })
      if (!res.ok) throw new Error(`Błąd tworzenia linku (${res.status})`)
      const payload = await res.json().catch(() => null)
      const uploadUrl = payload?.uploadUrl
      const qrUrl = payload?.qrCodeUrl
      if (uploadUrl) {
        setDocUrlByAwizacja((prev) => ({ ...prev, [dialogItem.numerAwizacji]: uploadUrl }))
      }
      if (qrUrl) {
        setQrCodeUrl(qrUrl)
        setLinksCache((prev) => ({ ...prev, [dialogItem.numerAwizacji]: qrUrl }))
      }
      window.alert('Link utworzony.')
    } catch (err) {
      setError(err.message || 'Nie udało się utworzyć linku')
    } finally {
      setCreatingLink(false)
    }
  }

  const handleMarkInProgressAndPrint = async () => {
    if (!dialogItem?.id) {
      window.print()
      return
    }

    // Jeśli już realizowane, tylko drukuj
    if (dialogItem.status === 'Realizowane') {
      window.print()
      return
    }

    const prevQueue = [...queue]
    const prevInProgress = [...inProgress]
    const fromQueue = queue.find((i) => i.id === dialogItem.id)
    if (!fromQueue) {
      window.print()
      return
    }

    const updatedQueue = queue.filter((i) => i.id !== dialogItem.id)
    const updatedItem = { ...fromQueue, status: 'Realizowane' }
    const updatedInProgress = sortByStart([...inProgress, updatedItem])

    setQueue(updatedQueue)
    setInProgress(updatedInProgress)

    try {
      await patchStatus(dialogItem.id, 'Realizowane')
      window.print()
    } catch (err) {
      setError(err.message || 'Nie udało się zmienić statusu')
      setQueue(prevQueue)
      setInProgress(prevInProgress)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <GlobalStyles
        styles={{
          '@media print': {
            'body *': {
              visibility: 'hidden',
            },
            '.print-content, .print-content *': {
              visibility: 'visible',
            },
            '.MuiDialog-root, .MuiDialog-container, .MuiDialog-paper': {
              position: 'static',
              inset: '0 !important',
              transform: 'none !important',
              boxShadow: 'none',
              margin: 0,
            },
            '.print-content': {
              padding: '0 16px 16px',
            },
            '.no-print': {
              display: 'none !important',
            },
          },
        }}
      />
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Zarządzanie misjami
          </Typography>
          <Chip
            label={isWorkerMode ? 'Tryb: Pracownik' : 'Tryb: Lider'}
            color={isWorkerMode ? 'warning' : 'info'}
            size="small"
            sx={{ mr: 2 }}
          />
          <Button variant="outlined" color="inherit" onClick={toggleMode}>
            Zmiana trybu
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }} maxWidth={false}>
        {error && (
          <Paper
            elevation={0}
            sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'error.light', bgcolor: 'error.lighter' }}
          >
            <Typography color="error.main" fontWeight={700}>
              {error}
            </Typography>
          </Paper>
        )}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Column
                title="Dostępne misje"
                droppableId="pool"
                items={pool.map((item) => ({
                  ...item,
                  isDragDisabled: isWorkerMode,
                  docUrl: docUrlByAwizacja[item.numerAwizacji],
                }))}
                expandedId={expandedId}
                onToggle={
                  isWorkerMode
                    ? undefined
                    : (id) => setExpandedId((prev) => (prev === id ? null : id))
                }
                onDelete={handleDelete}
                isDropDisabled={isWorkerMode}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Column
                title="Oczekujące Misje"
                droppableId="queue"
                items={queue.map((item) => ({
                  ...item,
                  isDragDisabled: isWorkerMode,
                  docUrl: docUrlByAwizacja[item.numerAwizacji],
                }))}
                expandedId={expandedId}
                onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
                onPrint={(item) => setDialogItem(item)}
                isDropDisabled={isWorkerMode}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Column
                title="Realizowane misje"
                droppableId="inProgress"
                items={inProgress.map((item) => ({
                  ...item,
                  isDragDisabled: true,
                  docUrl: docUrlByAwizacja[item.numerAwizacji],
                }))}
                expandedId={expandedId}
                onToggle={(id) => {
                  const found = inProgress.find((x) => x.id === id)
                  if (found) setDialogItem(found)
                  setExpandedId((prev) => (prev === id ? null : id))
                }}
                onPrint={(item) => setDialogItem(item)}
                isDropDisabled
              />
            </Grid>
            <Grid item xs={12}>
              <Column
                title="Zakończone misje"
                droppableId="done"
                items={done.map((item) => ({
                  ...item,
                  isDragDisabled: true,
                  docUrl: docUrlByAwizacja[item.numerAwizacji],
                }))}
                expandedId={expandedId}
                onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
                onDelete={handleDelete}
                isDropDisabled
              />
            </Grid>
          </Grid>
        </DragDropContext>
      </Container>

      <Dialog open={Boolean(dialogItem)} onClose={() => setDialogItem(null)} maxWidth="sm" fullWidth>
        <Box className="print-content">
          <DialogTitle>Szczegóły obiektu</DialogTitle>
          <DialogContent dividers>
            {dialogItem && (
              <Stack spacing={1}>
                <Typography>
                  <strong>Numer awizacji:</strong> {dialogItem.numerAwizacji}
                </Typography>
                <Typography>
                  <strong>Rodzaj:</strong> {dialogItem.rodzaj}
                </Typography>
                <Typography>
                  <strong>Magazyn:</strong> {dialogItem.magazyn}
                </Typography>
                <Typography>
                  <strong>Kierowca:</strong> {dialogItem.kierowca}
                </Typography>
                <Typography>
                  <strong>Numer pojazdu:</strong> {dialogItem.numerPojazdu}
                </Typography>
                <Typography>
                  <strong>Planowana data:</strong> {dialogItem.planowanaData}
                </Typography>
                <Typography>
                  <strong>Planowana godzina:</strong> {dialogItem.planowanaGodzina}
                </Typography>
                <Typography>
                  <strong>Godzina rozpoczęcia:</strong> {dialogItem.godzinaRozpoczecia}
                </Typography>
                <Typography>
                  <strong>Ilość zamówień:</strong> {dialogItem.iloscZamowien}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {dialogItem.status}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Zamówienia
                </Typography>
                {(dialogItem.orders ?? []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Brak zamówień.
                  </Typography>
                )}
                {(dialogItem.orders ?? []).map((o, idx) => (
                  <Typography key={idx} variant="body2" color="text.secondary">
                    • Strefa: {o.strefa}, Grupa: {o.grupa_towarowa}, Dostawca: {o.dostawca}, Nośniki:{' '}
                    {o.ilosc_nosnikow}, Ref.: {o.ilosc_referencji}
                  </Typography>
                ))}
                {qrCodeUrl && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" fontWeight={700}>
                      QR Code
                    </Typography>
                    <Box
                      component="img"
                      src={qrCodeUrl}
                      alt="QR Code"
                      sx={{ maxWidth: 280, maxHeight: 280, border: '1px solid', borderColor: 'divider' }}
                    />
                  </>
                )}
              </Stack>
            )}
          </DialogContent>
        </Box>
        <DialogActions className="no-print">
          <Button
            variant="outlined"
            onClick={handleCreateLink}
            disabled={
              creatingLink ||
              !dialogItem?.numerAwizacji ||
              Boolean(qrCodeUrl) ||
              Boolean(docUrlByAwizacja[dialogItem?.numerAwizacji])
            }
          >
            {creatingLink ? 'Tworzenie...' : 'Utwórz URL'}
          </Button>
          <Button startIcon={<PrintIcon />} variant="contained" onClick={handleMarkInProgressAndPrint}>
            Drukuj
          </Button>
          <Button onClick={() => setDialogItem(null)}>Zamknij</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmModeOpen} onClose={() => setConfirmModeOpen(false)}>
        <DialogTitle>Zmiana trybu</DialogTitle>
        <DialogContent dividers>
          <Typography>Dokonaj autoryzajci i potwierdź zmianę trybu</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmModeOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={confirmLeaderMode}>
            Potwierdzam
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App

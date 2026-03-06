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

function Tile({ awizacja, isDragging, expanded, onToggle, onDelete, onPrint, isQueue }) {
  return (
    <Paper
      elevation={isDragging ? 3 : 1}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: isDragging ? 'primary.main' : 'divider',
        backgroundColor: isDragging ? 'action.hover' : 'background.paper',
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
              {isQueue && (
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
          </Stack>
        )}
      </Stack>
    </Paper>
  )
}

function Column({ title, droppableId, items, expandedId, onToggle, onDelete, onPrint }) {
  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Typography variant="h6" fontWeight={800}>
        {title} <Chip label={items.length} size="small" sx={{ ml: 1 }} />
      </Typography>
      <Divider />
      <Droppable droppableId={droppableId}>
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
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
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
                        onToggle={() => onToggle(item.id)}
                        onDelete={() => onDelete?.(item.id)}
                        onPrint={() => onPrint?.(item)}
                        isQueue={droppableId === 'queue'}
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [dialogItem, setDialogItem] = useState(null)

  const patchStatus = async (id, status) => {
    const res = await fetch(`http://127.0.0.1:8000/api/queue/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error(`PATCH status failed (${res.status})`)
    return res.json()
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch('http://127.0.0.1:8000/api/queue')
      if (!res.ok) throw new Error(`Błąd API: ${res.status}`)
      const data = await res.json()
      const normalized = (data || []).map(mapFromApi)
      const poolItems = normalized.filter((i) => i.status !== 'Zakolejkowany')
      const queueItems = normalized.filter((i) => i.status === 'Zakolejkowany')
      setPool(sortByStart(poolItems))
      setQueue(queueItems)
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
    const { source, destination } = result
    if (!destination) return
    // nie pozwalamy na zmianę kolejności w ramach tej samej listy
    if (source.droppableId === destination.droppableId) {
      return
    }

    const prevPool = pool
    const prevQueue = queue

    if (source.droppableId === 'pool' && destination.droppableId === 'queue') {
      const sourceItems = Array.from(pool)
      const [moved] = sourceItems.splice(source.index, 1)
      moved.status = 'Zakolejkowany'
      const destItems = [...queue, moved] // zawsze na koniec
      setPool(sortByStart(sourceItems))
      setQueue(destItems)
      try {
        await patchStatus(moved.id, 'Zakolejkowany')
        await fetchData()
      } catch (err) {
        setError(err.message)
        setPool(prevPool)
        setQueue(prevQueue)
      }
      return
    }

    if (source.droppableId === 'queue' && destination.droppableId === 'pool') {
      const sourceItems = Array.from(queue)
      const [moved] = sourceItems.splice(source.index, 1)
      moved.status = 'Oczekujący'
      const destItems = sortByStart([...pool, moved])
      setQueue(sourceItems)
      setPool(destItems)
      try {
        await patchStatus(moved.id, 'Oczekujący')
        await fetchData()
      } catch (err) {
        setError(err.message)
        setQueue(prevQueue)
        setPool(prevPool)
      }
      return
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/queue/${id}`, { method: 'DELETE' })
      setPool((prev) => prev.filter((i) => i.id !== id))
      setQueue((prev) => prev.filter((i) => i.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      console.error('Delete error', err)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Kolejka (drag & drop)
          </Typography>
          <Chip label="Tryb demo" color="info" size="small" />
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
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
            <Grid item xs={12} md={6}>
              <Column
                title="Dostępne obiekty"
                droppableId="pool"
                items={pool}
                expandedId={expandedId}
                onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
                onDelete={handleDelete}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Column
                title="Kolejka"
                droppableId="queue"
                items={queue}
                expandedId={expandedId}
                onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
                onPrint={(item) => setDialogItem(item)}
              />
            </Grid>
          </Grid>
        </DragDropContext>
      </Container>

      <Dialog open={Boolean(dialogItem)} onClose={() => setDialogItem(null)} maxWidth="sm" fullWidth>
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
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogItem(null)}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App

import { useEffect, useState, useCallback, useRef } from 'react'
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
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PrintIcon from '@mui/icons-material/Print'
import MenuIcon from '@mui/icons-material/Menu'

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
  pobranaAt: item.pobrana_at ?? null,
  operatorIdentifier: item.pobrana_przez_identyfikator ?? '',
  operatorInitials: item.pobrana_przez_inicjaly ?? '',
})

function Tile({
  awizacja,
  isDragging,
  expanded,
  onToggle,
  onDelete,
  onPrint,
  isQueue,
  docUrl,
  deleteDisabled = false,
  printDisabled = false,
}) {
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
                  disabled={deleteDisabled}
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
                  disabled={printDisabled}
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
      {awizacja.status === 'Realizowane' && awizacja.operatorInitials && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
          <Chip size="small" label={awizacja.operatorInitials} color="success" variant="outlined" />
        </Box>
      )}
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
  const canDeleteInColumn = droppableId === 'pool' || droppableId === 'done'
  const isPrintDisabledInColumn = droppableId === 'pool'
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
                        deleteDisabled={!canDeleteInColumn}
                        printDisabled={isPrintDisabledInColumn}
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
  const [employees, setEmployees] = useState([])
  const [pool, setPool] = useState([])
  const [queue, setQueue] = useState([])
  const [inProgress, setInProgress] = useState([])
  const [done, setDone] = useState([])
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [dialogItem, setDialogItem] = useState(null)
  const [isWorkerMode, setIsWorkerMode] = useState(false)
  const [confirmModeOpen, setConfirmModeOpen] = useState(false)
  const [creatingLink, setCreatingLink] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [linksCache, setLinksCache] = useState({})
  const [docUrlByAwizacja, setDocUrlByAwizacja] = useState({})
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeModule, setActiveModule] = useState('missions')
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false)
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    id: '',
    firstName: '',
    lastName: '',
  })
  const employeeIdInputRef = useRef(null)
  const missionEmployeeIdInputRef = useRef(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [verifyIdentifier, setVerifyIdentifier] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [isVerifyingIdentifier, setIsVerifyingIdentifier] = useState(false)
  const [verifiedOperator, setVerifiedOperator] = useState(null)

  const API_BASE =
    import.meta.env.VITE_API_BASE ??
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://127.0.0.1:8001'
      : '')
  const fetchEmployees = useCallback(async () => {
    try {
      setEmployeesLoading(true)
      const res = await fetch(`${API_BASE}/api/employees`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Błąd pobierania pracowników (${res.status})`)
      const data = await res.json().catch(() => [])
      const normalized = (data || []).map((employee) => ({
        id: employee.id,
        identifier: employee.identifier,
        fullName: `${employee.first_name} ${employee.last_name}`.trim(),
        isActive: Boolean(employee.is_active),
      }))
      setEmployees(normalized)
    } catch (err) {
      setError(err.message || 'Nie udało się pobrać pracowników')
    } finally {
      setEmployeesLoading(false)
    }
  }, [API_BASE])

  const handleDeleteEmployee = async (employeeId) => {
    const prev = [...employees]
    setEmployees((current) => current.filter((employee) => employee.id !== employeeId))
    try {
      const res = await fetch(`${API_BASE}/api/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Nie udało się usunąć pracownika (${res.status})`)
    } catch (err) {
      setEmployees(prev)
      setError(err.message || 'Nie udało się usunąć pracownika')
    }
  }

  const handleDeactivateEmployee = async (employeeId) => {
    const prev = [...employees]
    setEmployees((current) =>
      current.map((employee) =>
        employee.id === employeeId ? { ...employee, isActive: false } : employee
      )
    )

    try {
      const res = await fetch(`${API_BASE}/api/employees/${employeeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ is_active: false }),
      })
      if (!res.ok) throw new Error(`Nie udało się dezaktywować pracownika (${res.status})`)
    } catch (err) {
      setEmployees(prev)
      setError(err.message || 'Nie udało się dezaktywować pracownika')
    }
  }

  const handleOpenAddEmployee = () => {
    setNewEmployee({ id: '', firstName: '', lastName: '' })
    setAddEmployeeOpen(true)
  }

  const handleAddEmployee = async () => {
    const identifier = newEmployee.id.trim()
    const firstName = newEmployee.firstName.trim()
    const lastName = newEmployee.lastName.trim()
    if (!identifier || !firstName || !lastName) return

    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          identifier,
          first_name: firstName,
          last_name: lastName,
        }),
      })
      if (!res.ok) throw new Error(`Nie udało się dodać pracownika (${res.status})`)
      const created = await res.json()
      setEmployees((prev) => [
        ...prev,
        {
          id: created.id,
          identifier: created.identifier,
          fullName: `${created.first_name} ${created.last_name}`.trim(),
          isActive: Boolean(created.is_active),
        },
      ])
      setAddEmployeeOpen(false)
    } catch (err) {
      setError(err.message || 'Nie udało się dodać pracownika')
    }
  }

  const openMissionVerifyDialog = () => {
    setVerifyIdentifier('')
    setVerifyError('')
    setVerifyDialogOpen(true)
  }

  const verifyEmployeeAndPrint = async () => {
    const identifier = verifyIdentifier.trim()
    if (!identifier) {
      setVerifyError('Niepoprawny identyfikator')
      return
    }

    try {
      setIsVerifyingIdentifier(true)
      const res = await fetch(`${API_BASE}/api/employees`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Nie udało się zweryfikować pracownika (${res.status})`)

      const data = await res.json().catch(() => [])
      const matchedEmployee = (data || []).find(
        (employee) => employee.identifier === identifier && Boolean(employee.is_active)
      )

      if (!matchedEmployee) {
        setVerifyError('Niepoprawny identyfikator')
        return
      }

      setVerifyDialogOpen(false)
      setVerifiedOperator({
        identifier: matchedEmployee.identifier,
        initials: `${(matchedEmployee.first_name?.[0] ?? '').toUpperCase()}${(matchedEmployee.last_name?.[0] ?? '').toUpperCase()}`,
      })
      await handleMarkInProgressAndPrint({
        identifier: matchedEmployee.identifier,
        initials: `${(matchedEmployee.first_name?.[0] ?? '').toUpperCase()}${(matchedEmployee.last_name?.[0] ?? '').toUpperCase()}`,
      })
    } catch (err) {
      setVerifyError(err.message || 'Nie udało się zweryfikować pracownika')
    } finally {
      setIsVerifyingIdentifier(false)
    }
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

  const patchStatus = async (id, status, extraPayload = {}) => {
    const res = await fetch(`${API_BASE}/api/queue/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ status, ...extraPayload }),
    })
    if (!res.ok) throw new Error(`PATCH status failed (${res.status})`)
    return res.json().catch(() => ({}))
  }

  const fetchData = useCallback(async () => {
    try {
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
    }
  }, [API_BASE])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (activeModule !== 'employees') return
    fetchEmployees()
  }, [activeModule, fetchEmployees])

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

  const handleDeleteRequest = (id) => {
    if (isWorkerMode) return
    setDeleteConfirmId(id)
  }

  const handleDelete = async () => {
    const id = deleteConfirmId
    if (!id || isWorkerMode) return
    if (isWorkerMode) return
    try {
      const res = await fetch(`${API_BASE}/api/queue/${id}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Nie udało się usunąć misji (${res.status})`)

      setPool((prev) => prev.filter((i) => i.id !== id))
      setQueue((prev) => prev.filter((i) => i.id !== id))
      setInProgress((prev) => prev.filter((i) => i.id !== id))
      setDone((prev) => prev.filter((i) => i.id !== id))
      if (expandedId === id) setExpandedId(null)
      if (dialogItem?.id === id) setDialogItem(null)
      setDeleteConfirmId(null)
    } catch (err) {
      setError(err.message || 'Nie udało się usunąć misji')
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

  const openModule = (module) => {
    if (isWorkerMode && module === 'employees') return
    setActiveModule(module)
    setMenuOpen(false)
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

  useEffect(() => {
    if (!addEmployeeOpen) return
    const focusTimeout = setTimeout(() => {
      employeeIdInputRef.current?.focus()
      employeeIdInputRef.current?.select?.()
    }, 80)

    return () => clearTimeout(focusTimeout)
  }, [addEmployeeOpen])

  useEffect(() => {
    if (!verifyDialogOpen) return
    const focusTimeout = setTimeout(() => {
      missionEmployeeIdInputRef.current?.focus()
      missionEmployeeIdInputRef.current?.select?.()
    }, 80)

    return () => clearTimeout(focusTimeout)
  }, [verifyDialogOpen])

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

  const handleMarkInProgressAndPrint = async (operator = verifiedOperator) => {
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
    const pickedAt = new Date().toISOString()
    const updatedItem = {
      ...fromQueue,
      status: 'Realizowane',
      pobranaAt: pickedAt,
      operatorIdentifier: operator?.identifier ?? '',
      operatorInitials: operator?.initials ?? '',
    }
    const updatedInProgress = sortByStart([...inProgress, updatedItem])

    setQueue(updatedQueue)
    setInProgress(updatedInProgress)

    try {
      await patchStatus(dialogItem.id, 'Realizowane', {
        pobrana_przez_identyfikator: operator?.identifier ?? null,
        pobrana_przez_inicjaly: operator?.initials ?? null,
        pobrana_at: pickedAt,
      })
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
            '@page': {
              size: 'A4 portrait',
              margin: '8mm',
            },
            'html, body': {
              width: '210mm',
              height: '297mm',
              margin: 0,
              padding: 0,
              overflow: 'hidden',
            },
            'body > *': {
              display: 'none !important',
            },
            '.MuiDialog-root, .MuiDialog-container, .MuiDialog-paper': {
              display: 'block !important',
              position: 'static',
              inset: '0 !important',
              transform: 'none !important',
              boxShadow: 'none',
              margin: 0,
              background: '#fff !important',
              backgroundImage: 'none !important',
            },
            '.MuiDialogTitle-root, .MuiDialogActions-root': {
              display: 'none !important',
            },
            '.print-content': {
              display: 'block',
              padding: '0 16px 16px',
              maxHeight: 'calc(297mm - 16mm)',
              overflow: 'hidden',
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              background: '#fff !important',
              backgroundImage: 'none !important',
            },
            '.MuiDialogContent-root': {
              padding: '0 !important',
              overflow: 'hidden !important',
              background: '#fff !important',
              backgroundImage: 'none !important',
            },
            '.print-content *': {
              background: 'transparent !important',
              backgroundImage: 'none !important',
            },
            '.no-print': {
              display: 'none !important',
            },
          },
        }}
      />
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMenuOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
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

      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: 280 }}>
          <List>
            <ListItemButton
              selected={activeModule === 'missions'}
              onClick={() => openModule('missions')}
            >
              <ListItemText primary="Zarządzanie misjami" />
            </ListItemButton>
            <ListItemButton
              selected={activeModule === 'employees'}
              disabled={isWorkerMode}
              onClick={() => openModule('employees')}
            >
              <ListItemText
                primary="Zarządzanie pracownikami"
                secondary={isWorkerMode ? 'Dostępne tylko w trybie Lider' : null}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Container sx={{ py: 4 }} maxWidth={false}>
        {activeModule === 'employees' ? (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1.5}
            >
              <Typography variant="h5" fontWeight={700}>
                Zarządzanie pracownikami
              </Typography>
              <Button variant="contained" onClick={handleOpenAddEmployee}>
                Dodaj nowego pracownika
              </Button>
            </Stack>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Imię i nazwisko</TableCell>
                    <TableCell>Identyfikator</TableCell>
                    <TableCell>Status aktywności</TableCell>
                    <TableCell align="right">Akcje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeesLoading && (
                    <TableRow>
                      <TableCell colSpan={4}>Ładowanie pracowników...</TableCell>
                    </TableRow>
                  )}
                  {!employeesLoading && employees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>Brak pracowników.</TableCell>
                    </TableRow>
                  )}
                  {employees.map((employee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell>{employee.fullName}</TableCell>
                      <TableCell>{employee.identifier}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={employee.isActive ? 'Aktywny' : 'Nieaktywny'}
                          color={employee.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            disabled={!employee.isActive}
                            onClick={() => handleDeactivateEmployee(employee.id)}
                          >
                            Dezaktywuj
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            Usuń
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <>
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
                onDelete={handleDeleteRequest}
                onPrint={() => {}}
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
                onDelete={handleDeleteRequest}
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
                  setExpandedId((prev) => (prev === id ? null : id))
                }}
                onDelete={handleDeleteRequest}
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
                onDelete={handleDeleteRequest}
                isDropDisabled
              />
            </Grid>
          </Grid>
        </DragDropContext>
          </>
        )}
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
          <Button
            startIcon={<PrintIcon />}
            variant="contained"
            onClick={() => {
              setVerifiedOperator(null)
              openMissionVerifyDialog()
            }}
          >
            POBIERZ MISJĘ I DRUKUJ
          </Button>
          <Button onClick={() => setDialogItem(null)}>Zamknij</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Weryfikacja pracownika</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              label="Identyfikator"
              value={verifyIdentifier}
              onChange={(e) => {
                setVerifyIdentifier(e.target.value)
                if (verifyError) setVerifyError('')
              }}
              inputRef={missionEmployeeIdInputRef}
              autoFocus
              fullWidth
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  verifyEmployeeAndPrint()
                }
              }}
            />
            {verifyError && (
              <Typography color="error.main" variant="body2">
                {verifyError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Anuluj</Button>
          <Button
            variant="contained"
            onClick={verifyEmployeeAndPrint}
            disabled={isVerifyingIdentifier || !verifyIdentifier.trim()}
          >
            {isVerifyingIdentifier ? 'Weryfikacja...' : 'Potwierdź'}
          </Button>
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

      <Dialog open={Boolean(deleteConfirmId)} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Czy na pewno chcesz usunąć misję? Operacji nie będzie można cofnąć.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>Zrezygnuj</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Usuń
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addEmployeeOpen} onClose={() => setAddEmployeeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dodaj nowego pracownika</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Identyfikator"
              value={newEmployee.id}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, id: e.target.value }))}
              inputRef={employeeIdInputRef}
              autoFocus
              fullWidth
            />
            <TextField
              label="Imię"
              value={newEmployee.firstName}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, firstName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Nazwisko"
              value={newEmployee.lastName}
              onChange={(e) => setNewEmployee((prev) => ({ ...prev, lastName: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEmployeeOpen(false)}>Anuluj</Button>
          <Button
            variant="contained"
            onClick={handleAddEmployee}
            disabled={!newEmployee.id.trim() || !newEmployee.firstName.trim() || !newEmployee.lastName.trim()}
          >
            Dodaj
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default App

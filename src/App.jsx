import { useEffect, useMemo, useState } from 'react'
import TaskForm, { STATUSES, PRIORITIES } from './TaskForm.jsx'

const STORAGE_KEY = 'employee-task-dashboard.tasks'

const SEED = [
  { id: 't1', title: 'Prepare Q4 onboarding plan', description: 'Outline the first-week schedule for the October hires.', assignee: 'Amara Perera', priority: 'High', status: 'In Progress', dueDate: '2026-10-05' },
  { id: 't2', title: 'Update VPN access policy', description: 'Review the current policy and circulate changes to IT leads.', assignee: 'Daniel Fernando', priority: 'Medium', status: 'Pending', dueDate: '2026-10-12' },
  { id: 't3', title: 'Renew office software licences', description: 'Confirm seat counts and send the renewal request to finance.', assignee: 'Nisha Silva', priority: 'Low', status: 'Completed', dueDate: '2026-09-20' },
  { id: 't4', title: 'Fix payroll export formatting', description: 'The CSV export drops leading zeros on employee IDs.', assignee: 'Kasun Jayasinghe', priority: 'High', status: 'Pending', dueDate: '2026-09-25' },
]

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* fall through to seed data */ }
  return SEED
}

const today = () => new Date().toISOString().slice(0, 10)
const fmtDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
const slug = (s) => s.toLowerCase().replace(/\s+/g, '-')

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [formTask, setFormTask] = useState(undefined) // undefined = closed, null = add, object = edit
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) } catch { /* storage unavailable */ }
  }, [tasks])

  const counts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    progress: tasks.filter((t) => t.status === 'In Progress').length,
    done: tasks.filter((t) => t.status === 'Completed').length,
  }), [tasks])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter((t) =>
      (statusFilter === 'All' || t.status === statusFilter) &&
      (priorityFilter === 'All' || t.priority === priorityFilter) &&
      (!q || t.title.toLowerCase().includes(q))
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  }, [tasks, search, statusFilter, priorityFilter])

  const save = (data) => {
    setTasks((prev) => data.id ? prev.map((t) => (t.id === data.id ? data : t)) : [{ ...data, id: newId() }, ...prev])
    setFormTask(undefined)
  }

  const confirmDelete = () => {
    setTasks((prev) => prev.filter((t) => t.id !== deleting.id))
    setDeleting(null)
  }

  const filtering = search || statusFilter !== 'All' || priorityFilter !== 'All'
  const clear = () => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All') }

  const stats = [
    ['Total tasks', counts.total, 'total'],
    ['Pending', counts.pending, 'pending'],
    ['In progress', counts.progress, 'in-progress'],
    ['Completed', counts.done, 'completed'],
  ]

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Team tasks</h1>
          <p className="sub">Track what needs doing, who owns it, and when it is due.</p>
        </div>
        <button className="btn primary" onClick={() => setFormTask(null)}>Add task</button>
      </header>

      <section className="stats" aria-label="Task summary">
        {stats.map(([label, value, key]) => (
          <div key={key} className={`stat ${key}`}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </section>

      <section className="toolbar" aria-label="Filter tasks">
        <input type="search" placeholder="Search by title" aria-label="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select aria-label="Filter by priority" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        {filtering && <button className="btn ghost" onClick={clear}>Clear filters</button>}
      </section>

      {visible.length === 0 ? (
        <div className="empty">
          <p>{tasks.length === 0 ? 'No tasks yet.' : 'No tasks match these filters.'}</p>
          {tasks.length === 0
            ? <button className="btn primary" onClick={() => setFormTask(null)}>Add your first task</button>
            : <button className="btn ghost" onClick={clear}>Clear filters</button>}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Task</th><th>Assigned to</th><th>Priority</th><th>Status</th><th>Due</th><th><span className="sr">Actions</span></th></tr>
            </thead>
            <tbody>
              {visible.map((t) => {
                const overdue = t.status !== 'Completed' && t.dueDate < today()
                return (
                  <tr key={t.id}>
                    <td data-label="Task">
                      <strong>{t.title}</strong>
                      {t.description && <p className="desc">{t.description}</p>}
                    </td>
                    <td data-label="Assigned to">{t.assignee}</td>
                    <td data-label="Priority"><span className={`pill priority ${slug(t.priority)}`}>{t.priority}</span></td>
                    <td data-label="Status"><span className={`pill status ${slug(t.status)}`}>{t.status}</span></td>
                    <td data-label="Due" className={overdue ? 'overdue' : ''}>{fmtDate(t.dueDate)}{overdue && ' (overdue)'}</td>
                    <td className="row-actions">
                      <button className="btn small ghost" onClick={() => setFormTask(t)} aria-label={`Edit ${t.title}`}>Edit</button>
                      <button className="btn small danger" onClick={() => setDeleting(t)} aria-label={`Delete ${t.title}`}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {formTask !== undefined && <TaskForm task={formTask} onSave={save} onClose={() => setFormTask(undefined)} />}

      {deleting && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setDeleting(null)}>
          <div className="modal small" role="alertdialog" aria-modal="true" aria-labelledby="del-title">
            <h2 id="del-title">Delete this task?</h2>
            <p>“{deleting.title}” will be removed permanently.</p>
            <div className="actions">
              <button className="btn ghost" autoFocus onClick={() => setDeleting(null)}>Keep task</button>
              <button className="btn danger solid" onClick={confirmDelete}>Delete task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

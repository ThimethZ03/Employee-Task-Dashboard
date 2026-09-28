import { useEffect, useState } from 'react'

export const STATUSES = ['Pending', 'In Progress', 'Completed']
export const PRIORITIES = ['Low', 'Medium', 'High']

const empty = { title: '', description: '', assignee: '', priority: 'Medium', status: 'Pending', dueDate: '' }

export default function TaskForm({ task, onSave, onClose }) {
  const [form, setForm] = useState(task ?? empty)
  const [errors, setErrors] = useState({})
  const editing = Boolean(task)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Enter a task title.'
    if (!form.assignee.trim()) next.assignee = 'Enter who this task is assigned to.'
    if (!form.dueDate) next.dueDate = 'Choose a due date.'
    setErrors(next)
    if (Object.keys(next).length === 0) {
      onSave({ ...form, title: form.title.trim(), description: form.description.trim(), assignee: form.assignee.trim() })
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-labelledby="form-title">
        <h2 id="form-title">{editing ? 'Edit task' : 'Add task'}</h2>

        <label>
          Task title
          <input autoFocus value={form.title} onChange={set('title')} aria-invalid={!!errors.title} />
          {errors.title && <span className="error">{errors.title}</span>}
        </label>

        <label>
          Description
          <textarea rows="3" value={form.description} onChange={set('description')} />
        </label>

        <div className="row">
          <label>
            Assigned to
            <input value={form.assignee} onChange={set('assignee')} aria-invalid={!!errors.assignee} />
            {errors.assignee && <span className="error">{errors.assignee}</span>}
          </label>
          <label>
            Due date
            <input type="date" value={form.dueDate} onChange={set('dueDate')} aria-invalid={!!errors.dueDate} />
            {errors.dueDate && <span className="error">{errors.dueDate}</span>}
          </label>
        </div>

        <div className="row">
          <label>
            Priority
            <select value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">{editing ? 'Save changes' : 'Add task'}</button>
        </div>
      </form>
    </div>
  )
}

import React, { useState } from 'react'
import { Card, Button, Input, Badge, Modal, Alert } from '../../common'

const CustomerNotes = ({ 
  customer,
  notes = [],
  onAddNote,
  onEditNote,
  onDeleteNote,
  loading = false,
  className = ''
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    tags: []
  })
  const [errors, setErrors] = useState({})

  const noteTypes = [
    { value: 'general', label: 'General', color: 'blue' },
    { value: 'appointment', label: 'Appointment', color: 'green' },
    { value: 'medical', label: 'Medical', color: 'red' },
    { value: 'preference', label: 'Preference', color: 'purple' },
    { value: 'complaint', label: 'Complaint', color: 'orange' },
    { value: 'compliment', label: 'Compliment', color: 'pink' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'red' }
  ]

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeColor = (type) => {
    const noteType = noteTypes.find(t => t.value === type)
    return noteType ? noteType.color : 'blue'
  }

  const getPriorityColor = (priority) => {
    const priorityLevel = priorityLevels.find(p => p.value === priority)
    return priorityLevel ? priorityLevel.color : 'yellow'
  }

  const handleAddNote = () => {
    setNewNote({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      tags: []
    })
    setErrors({})
    setShowAddModal(true)
  }

  const handleEditNote = (note) => {
    setSelectedNote(note)
    setNewNote({
      title: note.title,
      content: note.content,
      type: note.type,
      priority: note.priority,
      tags: note.tags || []
    })
    setErrors({})
    setShowEditModal(true)
  }

  const handleDeleteNote = (note) => {
    setSelectedNote(note)
    setShowDeleteModal(true)
  }

  const validateNote = () => {
    const newErrors = {}

    if (!newNote.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!newNote.content.trim()) {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveNote = () => {
    if (validateNote()) {
      if (selectedNote) {
        onEditNote(selectedNote.id, newNote)
        setShowEditModal(false)
      } else {
        onAddNote(newNote)
        setShowAddModal(false)
      }
      setSelectedNote(null)
    }
  }

  const handleConfirmDelete = () => {
    onDeleteNote(selectedNote.id)
    setShowDeleteModal(false)
    setSelectedNote(null)
  }

  const handleTagInput = (e) => {
    const value = e.target.value
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
    setNewNote(prev => ({ ...prev, tags }))
  }

  const renderNoteCard = (note) => (
    <Card key={note.id} className="hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">{note.title}</h4>
              <Badge variant={getTypeColor(note.type)} size="sm">
                {noteTypes.find(t => t.value === note.type)?.label}
              </Badge>
              <Badge variant={getPriorityColor(note.priority)} size="sm">
                {priorityLevels.find(p => p.value === note.priority)?.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {note.content}
            </p>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By {note.author || 'Staff'}</span>
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>
          <div className="flex gap-1 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditNote(note)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDeleteNote(note)}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )

  const renderAddEditModal = () => (
    <Modal
      isOpen={showAddModal || showEditModal}
      onClose={() => {
        setShowAddModal(false)
        setShowEditModal(false)
        setSelectedNote(null)
        setErrors({})
      }}
      title={selectedNote ? 'Edit Note' : 'Add New Note'}
      size="lg"
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={newNote.title}
          onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
          error={errors.title}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter note content..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={newNote.type}
              onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              {noteTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={newNote.priority}
              onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            >
              {priorityLevels.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <Input
            value={newNote.tags.join(', ')}
            onChange={handleTagInput}
            placeholder="Enter tags separated by commas"
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate multiple tags with commas
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowAddModal(false)
              setShowEditModal(false)
              setSelectedNote(null)
              setErrors({})
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveNote}
            className="flex-1"
          >
            {selectedNote ? 'Update Note' : 'Add Note'}
          </Button>
        </div>
      </div>
    </Modal>
  )

  const renderDeleteModal = () => (
    <Modal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false)
        setSelectedNote(null)
      }}
      title="Delete Note"
      size="md"
    >
      <div className="space-y-4">
        <Alert type="error">
          This action cannot be undone. The note will be permanently deleted.
        </Alert>
        
        <p className="text-sm text-gray-600">
          Are you sure you want to delete the note <strong>"{selectedNote?.title}"</strong>?
        </p>
        
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowDeleteModal(false)
              setSelectedNote(null)
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            className="flex-1"
          >
            Delete Note
          </Button>
        </div>
      </div>
    </Modal>
  )

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Notes</h2>
          <p className="text-gray-600">
            {customer ? `Notes for ${customer.name}` : 'Customer notes and observations'}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddNote}
        >
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading notes...</p>
          </div>
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map(renderNoteCard)}
        </div>
      ) : (
        <Card>
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-4">
              Start documenting important information about this customer.
            </p>
            <Button
              variant="primary"
              onClick={handleAddNote}
            >
              Add First Note
            </Button>
          </div>
        </Card>
      )}

      {/* Modals */}
      {renderAddEditModal()}
      {renderDeleteModal()}
    </div>
  )
}

export default CustomerNotes

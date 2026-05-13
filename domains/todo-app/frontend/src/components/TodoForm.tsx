import React, { useState } from 'react';

interface TodoFormProps {
  onSubmit: (title: string) => Promise<void>;
}

export const TodoForm: React.FC<TodoFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title);
      setTitle('');
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        maxLength={200}
        disabled={isSubmitting}
        className="todo-input"
      />
      <button type="submit" disabled={!title.trim() || isSubmitting} className="add-button">
        {isSubmitting ? 'Adding...' : 'Add'}
      </button>
    </form>
  );
};

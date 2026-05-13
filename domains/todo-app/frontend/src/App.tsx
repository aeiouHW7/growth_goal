import React, { useState, useEffect } from 'react';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { todoApi } from './services/api';
import type { Todo } from './types/todo';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载所有待办事项
  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoApi.getAll();
      setTodos(data);
    } catch (err) {
      setError('Failed to load todos. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 创建待办事项
  const handleCreate = async (title: string) => {
    const newTodo = await todoApi.create({ title });
    setTodos([newTodo, ...todos]);
  };

  // 切换完成状态
  const handleToggle = async (id: number, completed: boolean) => {
    await todoApi.update(id, { completed });
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed } : todo));
  };

  // 删除待办事项
  const handleDelete = async (id: number) => {
    await todoApi.delete(id);
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>TODO App</h1>
          <p className="subtitle">Powered by ACE Engine</p>
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadTodos}>Retry</button>
          </div>
        )}

        {!error && (
          <>
            <TodoForm onSubmit={handleCreate} />

            {loading ? (
              <div className="loading">Loading todos...</div>
            ) : (
              <>
                <div className="stats">
                  <span>{todos.length} total</span>
                  <span>•</span>
                  <span>{todos.filter(t => !t.completed).length} active</span>
                  <span>•</span>
                  <span>{todos.filter(t => t.completed).length} completed</span>
                </div>
                <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

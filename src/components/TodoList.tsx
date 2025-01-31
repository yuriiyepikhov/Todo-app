/* eslint-disable jsx-a11y/label-has-associated-control */

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { getFilteredTodos } from '../utils/getFilteredTodos';
import { deleteTodo, patchTodo } from '../api/todos';
import { Todo } from '../types/Todo';
import { ErrorType } from '../types/ErrorType';
import { TodoContext } from './TodoProvider';

export const TodoList: React.FC = () => {
  const {
    todos,
    setTodos,
    filterOption,
    tempTodo,
    errorText,
    setErrorText,
    clearErrorAfterTimeout,
    toggleAllStatus,
    isCompletedDeleting,
  } = useContext(TodoContext);

  const [editingTodoQuery, setEditingTodoQuery] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);

  const editingTodoField = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (
      (editingTodoField.current && editingTodoId) ||
      (editingTodoField.current &&
        editingTodoId &&
        errorText === ErrorType.unableToUpdate)
    ) {
      editingTodoField.current.focus();
    }
  }, [editingTodoId, errorText]);

  const visibleTodos = useMemo(
    () => getFilteredTodos(todos, filterOption),
    [todos, filterOption],
  );

  const handleCheckboxChange = useCallback(
    (todo: Todo): void => {
      if (errorText) {
        setErrorText(null);
      }

      const { id, completed } = todo;

      setUpdatingTodoId(id);

      patchTodo({ ...todo, completed: !completed })
        .then(() => {
          setTodos(
            todos.map(todoItem => {
              return todoItem.id === id
                ? { ...todoItem, completed: !completed }
                : todoItem;
            }),
          );
        })
        .catch(() => {
          setErrorText(ErrorType.unableToUpdate);
          clearErrorAfterTimeout();
        })
        .finally(() => setUpdatingTodoId(null));
    },
    [todos, setTodos, errorText, setErrorText, clearErrorAfterTimeout],
  );

  const startEditTodo = useCallback(
    (todoId: number, todoTitle: string): void => {
      setEditingTodoId(todoId);
      setEditingTodoQuery(todoTitle);
    },
    [],
  );

  const endEditTodo = useCallback((): void => {
    setEditingTodoId(null);
    setEditingTodoQuery('');
  }, []);

  const handleDeleteTodo = useCallback(
    (todoId: number): void => {
      if (errorText) {
        setErrorText(null);
      }

      setUpdatingTodoId(todoId);

      deleteTodo(todoId)
        .then(() => {
          setTodos(todos.filter(todoItem => todoItem.id !== todoId));
          endEditTodo();
        })
        .catch(() => {
          setErrorText(ErrorType.unableToDelete);
          clearErrorAfterTimeout();
        })
        .finally(() => setUpdatingTodoId(null));
    },
    [
      todos,
      setTodos,
      errorText,
      setErrorText,
      clearErrorAfterTimeout,
      endEditTodo,
    ],
  );

  const handleRenameTodo = useCallback(
    (todo: Todo, newTodoTitle: string): void => {
      if (errorText) {
        setErrorText(null);
      }

      setUpdatingTodoId(todo.id);

      patchTodo({ ...todo, title: newTodoTitle })
        .then(() => {
          setTodos(
            todos.map(todoItem =>
              todoItem.id === todo.id
                ? { ...todoItem, title: newTodoTitle }
                : todoItem,
            ),
          );
          endEditTodo();
        })
        .catch(() => {
          setErrorText(ErrorType.unableToUpdate);
          clearErrorAfterTimeout();
        })
        .finally(() => setUpdatingTodoId(null));
    },
    [
      todos,
      setTodos,
      errorText,
      setErrorText,
      clearErrorAfterTimeout,
      endEditTodo,
    ],
  );

  const editTodo = useCallback(
    (todo: Todo): void => {
      const { id, title } = todo;

      if (!editingTodoQuery.trim()) {
        handleDeleteTodo(id);
      } else if (editingTodoQuery.trim() !== title) {
        handleRenameTodo(todo, editingTodoQuery.trim());
      } else {
        endEditTodo();
      }
    },
    [editingTodoQuery, handleDeleteTodo, handleRenameTodo, endEditTodo],
  );

  const handleOnChangeEditingTodo = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setEditingTodoQuery(event.target.value);
    },
    [],
  );

  const handleOnKeyUpEditingTodo = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Escape') {
        endEditTodo();
      }
    },
    [endEditTodo],
  );

  const handleSubmitEditingTodo = useCallback(
    (event: React.FormEvent<HTMLFormElement>, todo: Todo): void => {
      event.preventDefault();

      editTodo(todo);
    },
    [editTodo],
  );

  const handleOnBlurEditingTodo = useCallback(
    (todo: Todo): void => {
      editTodo(todo);
    },
    [editTodo],
  );

  return (
    <section className="todoapp__main">
      {visibleTodos.map(todo => {
        const { id, title, completed } = todo;

        return (
          <div key={id} className={classNames('todo', { completed })}>
            <label className="todo__status-label">
              <input
                type="checkbox"
                className="todo__status"
                checked={completed}
                onChange={() => handleCheckboxChange(todo)}
              />
            </label>

            {editingTodoId === id ? (
              <form onSubmit={event => handleSubmitEditingTodo(event, todo)}>
                <input
                  ref={editingTodoField}
                  type="text"
                  className="todo__title-field"
                  placeholder="Empty todo will be deleted"
                  value={editingTodoQuery}
                  onChange={handleOnChangeEditingTodo}
                  onKeyUp={handleOnKeyUpEditingTodo}
                  onBlur={() => handleOnBlurEditingTodo(todo)}
                  disabled={updatingTodoId === id}
                />
              </form>
            ) : (
              <>
                <span
                  className="todo__title"
                  onDoubleClick={() => startEditTodo(id, title)}
                >
                  {title}
                </span>

                <button
                  type="button"
                  className="todo__remove"
                  onClick={() => handleDeleteTodo(id)}
                >
                  ×
                </button>
              </>
            )}

            <div
              className={classNames('modal', 'overlay', {
                'is-active':
                  updatingTodoId === id ||
                  (isCompletedDeleting && completed) ||
                  (toggleAllStatus !== null && toggleAllStatus === completed),
              })}
            >
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>
        );
      })}

      {!!tempTodo && (
        <>
          <div className="todo">
            <label className="todo__status-label">
              <input type="checkbox" className="todo__status" disabled />
            </label>

            <span className="todo__title">{tempTodo.title}</span>

            <button type="button" className="todo__remove" disabled>
              ×
            </button>

            <div className="modal overlay is-active">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div>
        </>
      )}
    </section>
  );
};

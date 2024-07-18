/* eslint-disable jsx-a11y/control-has-associated-label */

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { USER_ID, addTodo, patchTodo } from '../api/todos';
import { ErrorType } from '../types/ErrorType';
import { TodoContext } from './TodoProvider';

export const TodoApp: React.FC = () => {
  const {
    todos,
    setTodos,
    setTempTodo,
    errorText,
    setErrorText,
    clearErrorAfterTimeout,
    setToggleAllStatus,
  } = useContext(TodoContext);

  const [query, setQuery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const newTodoField = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (newTodoField.current && !isSubmitting) {
      newTodoField.current.focus();
    }
  }, [isSubmitting, todos]);

  const isEveryTodoCompleted = useMemo(
    () => todos.every(todo => todo.completed),
    [todos],
  );

  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setQuery(event.target.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      if (errorText) {
        setErrorText(null);
      }

      if (!query.trim()) {
        setErrorText(ErrorType.emptyTitle);
        clearErrorAfterTimeout();

        return;
      }

      setIsSubmitting(true);

      setTempTodo({
        id: 0,
        userId: USER_ID,
        title: query.trim(),
        completed: false,
      });

      addTodo({
        userId: USER_ID,
        title: query.trim(),
        completed: false,
      })
        .then(addedTodo => {
          setTodos([...todos, addedTodo]);
          setQuery('');
        })
        .catch(() => {
          setErrorText(ErrorType.unableToAdd);
          clearErrorAfterTimeout();
        })
        .finally(() => {
          setIsSubmitting(false);
          setTempTodo(null);
        });
    },
    [
      query,
      isSubmitting,
      todos,
      setTodos,
      errorText,
      setErrorText,
      clearErrorAfterTimeout,
      setTempTodo,
    ],
  );

  const handleToggleAllTodos = async () => {
    if (errorText) {
      setErrorText(null);
    }

    setToggleAllStatus(isEveryTodoCompleted);

    const updatedTodos = todos.map(todo => ({
      ...todo,
      completed: !isEveryTodoCompleted,
    }));

    const notCompletedTodos = todos.filter(({ completed }) => !completed);

    const updatedTodosPromises = isEveryTodoCompleted
      ? todos.map(todo => patchTodo({ ...todo, completed: false }))
      : notCompletedTodos.map(todo => patchTodo({ ...todo, completed: true }));

    try {
      await Promise.all(updatedTodosPromises);
      setTodos(updatedTodos);
    } catch (error) {
      setErrorText(ErrorType.unableToUpdate);
      clearErrorAfterTimeout();
    } finally {
      setToggleAllStatus(null);
    }
  };

  return (
    <header className="todoapp__header">
      {!!todos.length && (
        <button
          type="button"
          className={classNames('todoapp__toggle-all', {
            active: isEveryTodoCompleted,
          })}
          data-cy="ToggleAllButton"
          onClick={handleToggleAllTodos}
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          ref={newTodoField}
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={query}
          onChange={handleQueryChange}
          disabled={isSubmitting}
        />
      </form>
    </header>
  );
};

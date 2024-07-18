import React, { useCallback, useContext, useMemo } from 'react';
import classNames from 'classnames';
import { deleteTodo } from '../api/todos';
import { FilterOption } from '../types/FilterOption';
import { ErrorType } from '../types/ErrorType';
import { TodoContext } from './TodoProvider';

export const TodosFilter: React.FC = () => {
  const {
    todos,
    setTodos,
    filterOption,
    setFilterOption,
    errorText,
    setErrorText,
    clearErrorAfterTimeout,
    setIsCompletedDeleting,
  } = useContext(TodoContext);

  const countNotCompletedTodos = useCallback((): number => {
    let count = 0;

    todos.forEach(todo => {
      if (!todo.completed) {
        count += 1;
      }
    });

    return count;
  }, [todos]);

  const notCompletedQty = useMemo(
    () => countNotCompletedTodos(),
    [countNotCompletedTodos],
  );

  const completedQty = useMemo(
    () => todos.length - notCompletedQty,
    [todos, notCompletedQty],
  );

  const handleClearCompletedTodos = async () => {
    if (errorText) {
      setErrorText(null);
    }

    setIsCompletedDeleting(true);

    try {
      const completedTodos = todos.filter(todo => todo.completed);
      const idsOfCompletedToDelete = completedTodos.map(todo => todo.id);
      const promisesOfCompletedToDelete = completedTodos.map(({ id }) =>
        deleteTodo(id),
      );

      const results = await Promise.allSettled(promisesOfCompletedToDelete);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          idsOfCompletedToDelete.splice(index, 1);
        }
      });

      const updatedTodos = todos.filter(
        todo => !idsOfCompletedToDelete.includes(todo.id),
      );

      setTodos(updatedTodos);

      if (results.some(result => result.status === 'rejected')) {
        throw new Error();
      }
    } catch (error) {
      setErrorText(ErrorType.unableToDelete);
      clearErrorAfterTimeout();
    } finally {
      setIsCompletedDeleting(false);
    }
  };

  return (
    <footer className="todoapp__footer">
      <span className="todo-count">
        {notCompletedQty !== 1
          ? `${notCompletedQty} items left`
          : '1 item left'}
      </span>

      <nav className="filter">
        <a
          href="#/"
          className={classNames('filter__link', {
            selected: filterOption === FilterOption.all,
          })}
          onClick={() => setFilterOption(FilterOption.all)}
        >
          {FilterOption.all}
        </a>

        <a
          href="#/active"
          className={classNames('filter__link', {
            selected: filterOption === FilterOption.active,
          })}
          onClick={() => setFilterOption(FilterOption.active)}
        >
          {FilterOption.active}
        </a>

        <a
          href="#/completed"
          className={classNames('filter__link', {
            selected: filterOption === FilterOption.completed,
          })}
          onClick={() => setFilterOption(FilterOption.completed)}
        >
          {FilterOption.completed}
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        disabled={!completedQty}
        onClick={handleClearCompletedTodos}
      >
        Clear completed
      </button>
    </footer>
  );
};

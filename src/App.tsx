/* eslint-disable react-hooks/exhaustive-deps */

import React, { useContext, useEffect } from 'react';
import { getTodos } from './api/todos';
import { ErrorType } from './types/ErrorType';
import { TodoContext } from './components/TodoProvider';
import { TodoApp } from './components/TodoApp';
import { TodoList } from './components/TodoList';
import { TodosFilter } from './components/TodosFilter';
import { TodoError } from './components/TodoError';

export const App: React.FC = () => {
  const { todos, setTodos, setErrorText, clearErrorAfterTimeout } =
    useContext(TodoContext);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorText(ErrorType.unableToLoad);
        clearErrorAfterTimeout();
      });
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoApp />
        <TodoList />
        {!!todos.length && <TodosFilter />}
      </div>

      <TodoError />
    </div>
  );
};

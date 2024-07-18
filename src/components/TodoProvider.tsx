import React, { createContext, useCallback, useState } from 'react';
import { Todo } from '../types/Todo';
import { FilterOption } from '../types/FilterOption';
import { ErrorType } from '../types/ErrorType';

type ContextType = {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  filterOption: FilterOption;
  setFilterOption: (option: FilterOption) => void;
  tempTodo: Todo | null;
  setTempTodo: (todo: Todo | null) => void;
  errorText: ErrorType | null;
  setErrorText: (errorTxt: ErrorType | null) => void;
  clearErrorAfterTimeout: () => void;
  toggleAllStatus: boolean | null;
  setToggleAllStatus: (value: boolean | null) => void;
  isCompletedDeleting: boolean;
  setIsCompletedDeleting: (value: boolean) => void;
};

export const TodoContext = createContext<ContextType>({
  todos: [],
  setTodos: () => {},
  filterOption: FilterOption.all,
  setFilterOption: () => {},
  tempTodo: null,
  setTempTodo: () => {},
  errorText: null,
  setErrorText: () => {},
  clearErrorAfterTimeout: () => {},
  toggleAllStatus: null,
  setToggleAllStatus: () => {},
  isCompletedDeleting: false,
  setIsCompletedDeleting: () => {},
});

export const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [filterOption, setFilterOption] = useState<FilterOption>(
    FilterOption.all,
  );
  const [errorText, setErrorText] = useState<ErrorType | null>(null);
  const [errorTimeoutId, setErrorTimeoutId] = useState<number>(0);
  const [toggleAllStatus, setToggleAllStatus] = useState<boolean | null>(null);
  const [isCompletedDeleting, setIsCompletedDeleting] =
    useState<boolean>(false);

  const clearErrorAfterTimeout = useCallback(() => {
    if (errorTimeoutId) {
      window.clearTimeout(errorTimeoutId);
    }

    setErrorTimeoutId(window.setTimeout(() => setErrorText(null), 3000));
  }, [errorTimeoutId]);

  const data: ContextType = {
    todos,
    setTodos,
    filterOption,
    setFilterOption,
    tempTodo,
    setTempTodo,
    errorText,
    setErrorText,
    clearErrorAfterTimeout,
    toggleAllStatus,
    setToggleAllStatus,
    isCompletedDeleting,
    setIsCompletedDeleting,
  };

  return <TodoContext.Provider value={data}>{children}</TodoContext.Provider>;
};

import { Todo } from '../types/Todo';
import { FilterOption } from '../types/FilterOption';

export function getFilteredTodos(
  allTodos: Todo[],
  option: FilterOption,
): Todo[] {
  const filteredTodos = [...allTodos];

  switch (option) {
    case FilterOption.active:
      return filteredTodos.filter(todo => !todo.completed);
    case FilterOption.completed:
      return filteredTodos.filter(todo => todo.completed);
    default:
      return filteredTodos;
  }
}

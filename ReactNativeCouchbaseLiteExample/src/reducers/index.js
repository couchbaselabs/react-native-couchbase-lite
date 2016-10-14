import { combineReducers } from 'redux';
import todos from './todos';
import visibilityFilter from './visibilityFilter'

export const todoApp = combineReducers({
  todos,
  visibilityFilter
});

export const getVisibleTodos = (
  todos,
  filter
) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
  }
};

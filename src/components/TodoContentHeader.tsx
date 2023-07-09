import { FC, useState } from 'react';
import classNames from 'classnames';
import { todosApi } from '../api/todos-api';
import { useTodoContext } from '../context/todoContext/useTodoContext';
import { useErrorContext } from '../context/errorContext/useErrorContext';
import { Todo } from '../types/Todo';
import { TextField } from './TextField';

interface TodoContentHeaderProps {
  setTempTodo: (todo: Todo | null) => void
}

export const TodoContentHeader: FC<TodoContentHeaderProps> = (props) => {
  const { setTempTodo } = props;
  const [title, setTitle] = useState('');
  const [isHandleRequest, setIsHandleRequest] = useState(false);
  const {
    addTodo,
    size,
    countCompleted,
    todos,
    setHandlingTodoIds,
    updateTodos,
  } = useTodoContext();
  const { notifyAboutError } = useErrorContext();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title) {
      notifyAboutError("Title can't be empty");

      return;
    }

    try {
      setTempTodo({
        id: 0,
        title,
        completed: false,
        userId: 0,
      });
      setIsHandleRequest(true);
      const createdTodo = await todosApi.create({
        title,
        completed: false,
        userId: 10875,
      });

      addTodo(createdTodo);
    } catch {
      notifyAboutError('Unable to add a todo');
    } finally {
      setTitle('');
      setTempTodo(null);
      setIsHandleRequest(false);
    }
  };

  const onChangeStatus = async () => {
    let prepareToUpdate = [];

    if (countCompleted === size) {
      prepareToUpdate = todos.map(todo => ({
        id: todo.id,
        data: { completed: false },
      }));
    } else {
      prepareToUpdate = todos.filter(todo => !todo.completed).map(todo => ({
        id: todo.id,
        data: { completed: true },
      }));
    }

    try {
      const handleTodoIds = prepareToUpdate.map(todo => todo.id);

      setHandlingTodoIds(handleTodoIds);
      const updatedTodos = await todosApi
        .update(prepareToUpdate);

      updateTodos(updatedTodos);
    } catch {
      notifyAboutError('Unable to update todos');
    } finally {
      setHandlingTodoIds([]);
    }
  };

  return (
    <header className="todoapp__header">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button
        type="button"
        className={classNames(
          'todoapp__toggle-all', {
            active: countCompleted === size,
          },
        )}
        onClick={onChangeStatus}
      />

      <form onSubmit={submit}>
        <TextField
          value={title}
          onChange={setTitle}
          isDisabled={isHandleRequest}
        />
      </form>
    </header>
  );
};
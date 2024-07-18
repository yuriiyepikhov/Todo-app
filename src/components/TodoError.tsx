/* eslint-disable jsx-a11y/control-has-associated-label */

import React, { useContext } from 'react';
import classNames from 'classnames';
import { TodoContext } from './TodoProvider';

export const TodoError: React.FC = () => {
  const { errorText, setErrorText } = useContext(TodoContext);

  return (
    <div
      data-cy="ErrorNotification"
      className={classNames(
        'notification',
        'is-danger',
        'is-light',
        'has-text-weight-normal',
        { hidden: !errorText },
      )}
    >
      <button
        data-cy="HideErrorButton"
        type="button"
        className="delete"
        onClick={() => setErrorText(null)}
      />
      {errorText}
    </div>
  );
};

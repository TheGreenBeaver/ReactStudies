import React from 'react';
import { Link } from 'react-router-dom';
import { links } from '../routing';
import tasksService from '../../../api/tasks';
import useFetch from '../../../util/hooks';

function TasksList() {
  const { data: tasks, isFetching } = useFetch(() => tasksService.list(), {
    transformer: r => r.data
  })

  if (isFetching) {
    return 'Loading...';
  }

  return (
    <div>
      <Link to={links.add.path}>
        Add new
      </Link>
      <ul>
        {
          tasks.map(task =>
            <li key={task.id}>
              <Link to={links.single.get(task.id)}>{task.title}</Link>
            </li>
          )
        }
      </ul>
    </div>
  );
}

export default TasksList;
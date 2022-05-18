import React from 'react';
import { useParams } from 'react-router-dom';
import tasksService from '../../../api/tasks';
import useFetch from '../../../util/hooks';


function SingleTask() {
  const { id } = useParams();
  const { data: taskData, isFetching } = useFetch(currId => tasksService.get(currId), {
    initialData: null, condition: !!id, deps: [id], transformer: r => r.data
  });

  if (isFetching) {
    return 'Loading...';
  }

  return (
    <div>
      <h3>{taskData.title}</h3>
      <img src={taskData.sampleImage} alt='sample image' />
    </div>
  );
}

export default SingleTask;
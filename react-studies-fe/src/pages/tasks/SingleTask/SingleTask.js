import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import { useParams } from 'react-router-dom';


function SingleTask() {
  const { id } = useParams();
  const [task] = useFetch(api.tasks.retrieve, {
    deps: [id], initialData: null
  })
  return <div />;
}

export default SingleTask;

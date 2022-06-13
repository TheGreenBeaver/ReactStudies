import ManageTask from '../../../components/ManageTask';
import api from '../../../api';
import { getFormData } from '../../../util/form';


function CreateTask() {
  return (
    <ManageTask
      apiCall={api.tasks.create}
      canChangeKind
      transformForApi={getFormData}
      action='create'
      title='Create new task'
    />
  );
}

export default CreateTask;
import React from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { links } from '../../routing';
import tasksService from '../../../api/tasks';
import solutionsService from '../../../api/solutions';
import useFetch from '../../../util/hooks';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import EditableFile from '../../../ui-kit/form-builder/fields/file-field';
import { FIELD_TYPES, UNITS } from '../../../ui-kit/form-builder/util/validation';


const fieldNames = {
  files: 'files',
};
const accept = 'application/zip,application/javascript,image/*,text/plain,text/css,text/html,font/*';

function PageContent({ taskId }) {
  const history = useHistory();
  const { data: relatedTaskData, isFetching } = useFetch(
    currId => tasksService.get(currId), {
      initialData: null, deps: [taskId], condition: !!taskId
    }
  );

  if (isFetching) {
    return 'Loading...';
  }

  return (
    <SmartForm
      onSubmit={(values, formikHelpers) => {
        const formData = new FormData();
        const allFiles = values[fieldNames.files];
        allFiles.forEach(f => {
          formData.append(fieldNames.files, f, f.name);
        });
        formData.set('taskId', taskId);
        finishSubmit(
          solutionsService
            .create(formData)
            .then(resp => history.push(links.solutions.single.get(resp.data.id))),
          formikHelpers
        );
      }}
      initialValues={{
        [fieldNames.files]: []
      }}
      validationConfig={{
        [fieldNames.files]: [FIELD_TYPES.file, [250, UNITS.MB, accept, true]]
      }}
      submitText='Create'
    >
      <EditableFile
        accept={accept}
        label='Solution files'
        name={fieldNames.files}
      />
    </SmartForm>
  );
}

function AddSolution() {
  const { search } = useLocation();
  const { task } = queryString.parse(search);

  if (!task) {
    return <Redirect to={links.tasks.list.path} />;
  }

  return <PageContent taskId={task} />;
}

export default AddSolution;
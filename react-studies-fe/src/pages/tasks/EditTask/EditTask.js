import { useParams } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import api from '../../../api';
import LoadingPage from '../../../components/LoadingPage';
import ManageTask, { fieldNames } from '../../../components/ManageTask';
import { useMemo } from 'react';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import { CAVEAT_FIELDS } from '../../../util/constants';
import { getFormData } from '../../../util/form';


function EditTask() {
  const { id } = useParams();
  const [task, isFetchingTask] = useFetch(api.tasks.retrieve, {
    deps: [id], initialData: null
  });

  const initialValues = useMemo(() => {
    if (!task) {
      return {};
    }

    const values = {
      ...pick(task, [
        fieldNames.title,
        fieldNames.description,
        fieldNames.trackUpdates
      ]),
      ...pick(task.reactTask, [
        fieldNames.hasFuzzing,
        fieldNames.dumpIsTemplate,
        fieldNames.dumpUploadUrl,
        fieldNames.dumpUploadMethod
      ]),
      [fieldNames.attachments]: [],
      [fieldNames.attachmentNames]: []
    };

    task.attachments.forEach(att => {
      values[fieldNames.attachments].push(omit(att, 'refName'));
      values[fieldNames.attachmentNames].push(att.refName);
    });

    if (!isEmpty(task.layoutTask)) {
      const { layoutTask } = task;
      values[fieldNames.sampleImage] = { location: layoutTask.sampleImage, mime: 'image/*' };
      values[fieldNames.mustUse] = layoutTask.elementRules.filter(rule => rule.kind === 'must_use');

      const absPosRules = layoutTask.elementRules.filter(rule => rule.kind === 'abs_pos');
      const rawSizingRules = layoutTask.elementRules.filter(rule => rule.kind === 'raw_sizing');

      if (absPosRules.length || layoutTask.absPosMaxUsage) {
        values[fieldNames.absPos] = {
          [CAVEAT_FIELDS.allowedFor]: absPosRules.length ? absPosRules : null,
          [CAVEAT_FIELDS.maxUsage]: layoutTask.absPosMaxUsage || null
        }
      }
      if (rawSizingRules.length || layoutTask.rawSizingMaxUsage) {
        values[fieldNames.rawSizing] = {
          [CAVEAT_FIELDS.allowedFor]: rawSizingRules.length ? rawSizingRules : null,
          [CAVEAT_FIELDS.maxUsage]: layoutTask.rawSizingMaxUsage || null
        }
      }
    }

    return values;
  }, [task]);

  function transformForApi(values, fields) {
    const valuesToSend = pick(values, fields);

    if (!(values[fieldNames.sampleImage] instanceof File)) {
      delete valuesToSend[fieldNames.sampleImage];
    }

    delete valuesToSend[fieldNames.kind];

    valuesToSend.attachmentsToDelete = initialValues[fieldNames.attachments]
      .map(att => att.id)
      .filter(attId => !values[fieldNames.attachments].some(att => att.id === attId));
    valuesToSend.attachmentsToCreate = values[fieldNames.attachmentNames].filter(att => att instanceof File);

    valuesToSend.newAttachmentNames = [];
    valuesToSend.oldAttachmentNames = [];

    values[fieldNames.attachmentNames].forEach((refName, idx) => {
      const file = values[fieldNames.attachments][idx];
      if (file instanceof File) {
        valuesToSend.newAttachmentNames.push(refName);
      } else {
        valuesToSend.oldAttachmentNames.push({ refName, id: file.id });
      }
    });

    delete valuesToSend[fieldNames.attachmentNames];
    delete valuesToSend[fieldNames.attachments];

    return getFormData(valuesToSend);
  }

  if (isFetchingTask) {
    return <LoadingPage />;
  }

  return (
    <ManageTask
      title='Edit task'
      apiCall={values => api.tasks.update(id, values)}
      initialValues={initialValues}
      transformForApi={transformForApi}
      action='update'
    />
  )
}

export default EditTask;

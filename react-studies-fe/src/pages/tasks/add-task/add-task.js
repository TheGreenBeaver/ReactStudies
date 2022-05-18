import React from 'react';
import tasksService from '../../../api/tasks';
import { useHistory } from 'react-router-dom';
import { links } from '../routing';
import SmartForm from '../../../ui-kit/form-builder/smart-form';
import finishSubmit from '../../../ui-kit/form-builder/util/finish-submit';
import EditableFile from '../../../ui-kit/form-builder/fields/file-field';
import StandardTextField from '../../../ui-kit/form-builder/fields/standard-text-field';


const fieldNames = {
  title: 'title',
  sampleImage: 'sampleImage',
  additionalAssets: 'additionalAssets',
  additionalText: 'additionalText',
  assertions: 'assertions'
};

function AddTask() {
  const history = useHistory();

  return (
    <SmartForm
      initialValues={{
        [fieldNames.title]: '',
        [fieldNames.sampleImage]: null,
        [fieldNames.additionalAssets]: [],
        [fieldNames.additionalText]: [],
        [fieldNames.assertions]: []
      }}
      submitText='Create'
      onSubmit={(values, formikHelpers) => {
        const formData = new FormData();
        formData.append(fieldNames.title, values[fieldNames.title]);
        const sampleImage = values[fieldNames.sampleImage];
        formData.append(fieldNames.sampleImage, sampleImage, sampleImage.name);

        // values.additionalAssets.forEach(asset => formData.append('additionalAssets', asset, asset.name));
        // values.additionalText.forEach(text => formData.append('additionalText', text));
        // values.assertions.forEach(assertion => formData.append('assertions', assertion));

        finishSubmit(
          tasksService.create(formData).then(resp => {
            history.push(links.single.get(resp.data.id));
          }),
          formikHelpers
        );
      }}
    >
      <StandardTextField required name={fieldNames.title} autoComplete='false' />
      <EditableFile
        name={fieldNames.sampleImage}
        label='Sample image'
        accept='image/*'
        multiple={false}
      />
    </SmartForm>
  );
}

export default AddTask;
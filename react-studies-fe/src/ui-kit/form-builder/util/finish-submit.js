import { mapValues } from 'lodash';


function finishSubmit(req, formikHelpers) {
  formikHelpers.setSubmitting(true);
  return req
    .catch(e => {
      const errorsObj = mapValues(e.response.data, v => v.join('; '));
      formikHelpers.setErrors(errorsObj);
    })
    .finally(() => formikHelpers.setSubmitting(false));
}

export default finishSubmit;
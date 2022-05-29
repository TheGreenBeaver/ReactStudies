import FileField from '../../../../../uiKit/SmartForm/fields/FileField';
import fieldNames from '../../fieldNames';
import fieldAccepts from '../../fieldAccepts';


function MainLayoutSettings() {
  return (
    <FileField
      accept={fieldAccepts[fieldNames.sampleImage]}
      name={fieldNames.sampleImage}
      label='Mockup'
    />
  );
}

export default MainLayoutSettings;
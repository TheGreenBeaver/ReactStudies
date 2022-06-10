import TemplateConfigField from '../../../../../uiKit/SmartForm/fields/TemplateConfigField';
import fieldNames from '../../fieldNames';


function MainReactSettings() {
  return (
    <>
      <TemplateConfigField
        getSpecialLabel={() => 'Route only allowed for authorized users'}
        templateName={fieldNames.authTemplate}
        getRouteLabels={() => ['Sign Up route', 'Log In route']}
        getEndpointLabels={({ hasVerification }) => {
          const labels = ['Sign Up API endpoint', 'Log In API endpoint'];
          if (hasVerification) {
            labels.push('Verification API endpoint');
          }
          return labels;
        }}
        templateLabel='Authentication / Authorization'
        flags={{ hasVerification: 'Require email verification' }}
        max={3}
      />
      <TemplateConfigField
        getSpecialLabel={({ hasSearch }) => hasSearch ? 'API endpoint returning search results' : null}
        templateName={fieldNames.entityListTemplate}
        getRouteLabels={() => ['Route']}
        getEndpointLabels={() => 'API endpoints'}
        templateLabel='Entity List'
        flags={{ hasSearch: 'Require server-side search' }}
        max={3}
      />
      <TemplateConfigField
        getSpecialLabel={() => null}
        templateName={fieldNames.singleEntityTemplate}
        getRouteLabels={() => ['Route']}
        getEndpointLabels={() => 'API endpoints'}
        templateLabel='Single Entity'
        max={3}
      />
    </>
  );
}

export default MainReactSettings;
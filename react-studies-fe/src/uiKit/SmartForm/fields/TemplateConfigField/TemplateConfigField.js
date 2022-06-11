import { objectOf, func, string, number } from 'prop-types';
import { useFormikContext } from 'formik';
import React, { useMemo } from 'react';
import mapValues from 'lodash/mapValues';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Collapse from '@mui/material/Collapse';
import useCollapse from '../../../../hooks/useCollapse';
import TextGroup from './TextGroup';
import StandardTextField from '../StandardTextField';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import Grid from '@mui/material/Grid';


function TemplateConfigField({ flags, templateName, getEndpointLabels, getRouteLabels, getSpecialLabel, templateLabel, max }) {
  const { setFieldValue, getFieldProps, isSubmitting, setValues } = useFormikContext();

  const { value: templateValue } = getFieldProps(templateName);

  const { flagValues, hasThisTemplate, endpointLabels, routeLabels, specialLabel } = useMemo(() => {
    const _hasThisTemplate = !!templateValue;
    const _flagValues = mapValues(flags, (_, flagName) => templateValue?.[flagName] || false);
    const _endpointLabels = getEndpointLabels(_flagValues);
    const _routeLabels = getRouteLabels(_flagValues);
    const _specialLabel = getSpecialLabel(_flagValues);
    return {
      hasThisTemplate: _hasThisTemplate,
      flagValues: _flagValues,
      endpointLabels: _endpointLabels,
      routeLabels: _routeLabels,
      specialLabel: _specialLabel
    };
  }, [templateValue]);

  const emptyTemplate = useMemo(() => {
    const emptyFlags = mapValues(flags, () => false);
    const emptyEndpoints = getEndpointLabels(emptyFlags);
    const emptyRoutes = getRouteLabels(emptyFlags);
    const emptySpecial = getSpecialLabel(emptyFlags);
    return {
      endpoints: Array.isArray(emptyEndpoints) ? emptyEndpoints.map(() => '') : [''],
      routes: Array.isArray(emptyRoutes) ? emptyRoutes.map(() => '') : [''],
      special: emptySpecial ? '' : null,
      ...emptyFlags
    };
  }, []);

  function setHasThisTemplate(newHasThisTemplate) {
    setFieldValue(templateName, newHasThisTemplate ? emptyTemplate : null);
  }

  const [
    hasThisTemplateCollapseProps,
    closeHasThisTemplateCollapse
  ] = useCollapse(() => setHasThisTemplate(false), hasThisTemplate);

  function toggleHasThisTemplate({ target: { checked } }) {
    if (checked) {
      setHasThisTemplate(true);
    } else {
      closeHasThisTemplateCollapse();
    }
  }

  return (
    <Box>
      <FormControlLabel
        disabled={isSubmitting}
        control={<Checkbox checked={hasThisTemplate} onChange={toggleHasThisTemplate} />}
        label={<Typography variant='h6' mb={0}>Include {templateLabel} template</Typography>}
      />
      <Collapse orientation='vertical' {...hasThisTemplateCollapseProps}>
        <Typography my={0.5}>
          You don't have to strictly define all the text fields - everything you skip will be filled in by the students
        </Typography>
        {Object.entries(flagValues).map(([flagName, flagValue]) => (
          <FormControlLabel
            key={flagName}
            disabled={isSubmitting}
            control={
              <Checkbox
                checked={flagValue}
                onChange={({ target: { checked } }) => {
                  setValues(allValues => {
                    const newValues = cloneDeep(allValues);
                    const curr = allValues[templateName];
                    set(newValues, [templateName, flagName], checked);
                    const newFlagValues = { ...flagValues, [flagName]: checked };
                    const newEndpointLabels = getEndpointLabels(newFlagValues);
                    const newRouteLabels = getRouteLabels(newFlagValues);
                    const newSpecialLabel = getSpecialLabel(newFlagValues);
                    set(
                      newValues,
                      [templateName, 'routes'],
                      Array.isArray(newRouteLabels)
                        ? newRouteLabels.map((_, idx) => curr.routes[idx] || '')
                        : curr.routes
                    );
                    set(
                      newValues,
                      [templateName, 'endpoints'],
                      Array.isArray(newEndpointLabels)
                        ? newEndpointLabels.map((_, idx) => curr.endpoints[idx] || '')
                        : curr.endpoints
                    );
                    set(newValues, [templateName, 'special'], newSpecialLabel ? (curr.special || '') : null)
                    return newValues;
                  });
                }}
              />
            }
            label={flags[flagName]}
          />
        ))}
        <TextGroup max={max} name={`${templateName}.endpoints`} labels={endpointLabels} />
        <TextGroup max={max} name={`${templateName}.routes`} labels={routeLabels} />
        {!!specialLabel && (
          <Grid container spacing={2}>
            <Grid item xs={4}><StandardTextField name={`${templateName}.special`} label={specialLabel} /></Grid>
          </Grid>
        )}
      </Collapse>
    </Box>
  );
}

TemplateConfigField.propTypes = {
  // hasVerification, hasSearch
  flags: objectOf(string),
  getRouteLabels: func.isRequired,
  getEndpointLabels: func.isRequired,
  getSpecialLabel: func.isRequired,
  templateName: string.isRequired,
  templateLabel: string.isRequired,
  max: number.isRequired
};

TemplateConfigField.defaultProps = {
  flags: {},
};

export default TemplateConfigField;
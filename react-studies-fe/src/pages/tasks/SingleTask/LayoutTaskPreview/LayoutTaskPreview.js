import { arrayOf, number, shape, string } from 'prop-types';
import Box from '@mui/material/Box';
import { useUserState } from '../../../../store/selectors';
import { useMemo } from 'react';
import groupBy from 'lodash/groupBy';
import ElementRulesTable from './ElementRulesTable';
import { ElementRule } from '../../../../util/types';
import Typography from '@mui/material/Typography';


function LayoutTaskPreview({ task: { layoutTask: {
  sampleImage, elementRules, absPosMaxUsage, rawSizingMaxUsage
} } }) {
  const { isTeacher } = useUserState();
  const { abs_pos, raw_sizing, must_use } = useMemo(() => groupBy(elementRules, 'kind'), [elementRules]);

  const shouldAvoidAbsPos = absPosMaxUsage != null || !!abs_pos?.length;
  const shouldAvoidRawSizing = rawSizingMaxUsage != null || !!raw_sizing?.length;

  return (
    <>
      <Box>
        <Typography variant='h6'>Mockup</Typography>
        <img width='100%' alt='mockup' src={sampleImage} />
      </Box>

      {!!must_use?.length && (
        <Box>
          <Typography variant='h6'>Must-use tags</Typography>
          <ElementRulesTable
            tagHeader='Must use these tags...'
            contentHeader='... for these text blocks'
            tagEmptyString=''
            contentEmptyString='Any text block'
            rules={must_use}
          />
        </Box>
      )}

      {shouldAvoidAbsPos && (
        <Box>
          <Typography variant='h6' mb={0}>Should avoid using <code>position: absolute</code></Typography>
          {absPosMaxUsage != null && isTeacher && (
            <Typography>
              Checks will fail if more than {absPosMaxUsage}% of elements are positioned absolutely
            </Typography>
          )}
          {!!abs_pos?.length && (
            <>
              <Typography variant='subtitle1' my={0.5}>
                Absolute positioning will not be considered an error
              </Typography>
              <ElementRulesTable
                tagHeader='For these tags...'
                contentHeader='... and / or these text blocks'
                tagEmptyString='Any tag'
                contentEmptyString='Any text block'
                rules={abs_pos}
              />
            </>
          )}
        </Box>
      )}

      {shouldAvoidRawSizing && (
        <Box>
          <Typography variant='h6' mb={0}>Should prefer relative sizing to <code>px</code></Typography>
          {rawSizingMaxUsage != null && isTeacher && (
            <Typography>
              Checks will fail if more than {rawSizingMaxUsage}% of elements are sized absolutely
            </Typography>
          )}
          {!!raw_sizing?.length && (
            <>
              <Typography variant='subtitle1' my={0.5}>
                Absolute sizing will not be considered an error
              </Typography>
              <ElementRulesTable
                tagHeader='For these tags...'
                contentHeader='... and / or these text blocks'
                tagEmptyString='Any tag'
                contentEmptyString='Any text block'
                rules={raw_sizing}
              />
            </>
          )}
        </Box>
      )}
    </>
  )
}

LayoutTaskPreview.propTypes = {
  task: shape({
    layoutTask: shape({
      sampleImage: string.isRequired,
      absPosMaxUsage: number,
      rawSizingMaxUsage: number,
      elementRules: arrayOf(ElementRule).isRequired
    }).isRequired
  }).isRequired
};

export default LayoutTaskPreview;
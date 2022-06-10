import CheckboxField from '../../../../../uiKit/SmartForm/fields/CheckboxField';
import fieldNames from '../../fieldNames';
import { useFormikContext } from 'formik';
import Typography from '@mui/material/Typography';
import HelpBadge from '../../../../../uiKit/HelpBadge';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FileField from '../../../../../uiKit/SmartForm/fields/FileField';
import fieldAccepts from '../../fieldAccepts';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';


const SYNTAX_RULES = [
  {
    type: 'string',
    tokens: [
      {
        name: 'max',
        value: 'Positive integer',
        defaultValue: '100 if "email" is true',
        comment: 'Max length of the string'
      },
      {
        name: 'min',
        value: 'Positive integer',
        defaultValue: '15 if "email" is true',
        comment: 'Min length of the string'
      },
      {
        name: 'email',
        value: 'Boolean',
        defaultValue: 'false',
        comment: 'Should the string be a unique email. Fixes "max" = 100 and "min" = 15'
      },
    ]
  },
  {
    type: 'number',
    tokens: [
      {
        name: 'max',
        value: 'Number',
        defaultValue: '1000',
        comment: 'Max value'
      },
      {
        name: 'min',
        value: 'Number',
        defaultValue: '-1000',
        comment: 'Min value'
      },
      {
        name: 'int',
        value: 'Boolean',
        defaultValue: 'false',
        comment: 'Should the number be an integer'
      },
    ]
  },
  {
    type: 'date',
    tokens: [
      {
        name: 'format',
        value: 'String',
        defaultValue: 'YYYY-MM-DD:hh-mm-ss',
        comment:
          <MuiLink
            href='https://momentjs.com/docs/#/displaying/format/'
            target='_blank'
            rel='noopener noreferrer'
          >
            Documentation reference
          </MuiLink>
      },
      {
        name: 'allowPast',
        value: 'Boolean',
        defaultValue: 'true',
        comment: 'Should dates in the past be generated'
      },
      {
        name: 'allowFuture',
        value: 'Boolean',
        defaultValue: '',
        comment: 'Should dates in the future be generated'
      },
    ]
  },
  { type: 'bool' },
  {
    type: 'array',
    tokens: [
      {
        name: 'max',
        value: 'Positive integer',
        defaultValue: '60',
        comment: 'Max length'
      },
      {
        name: 'min',
        value: 'Positive integer',
        defaultValue: '1',
        comment: 'Min length'
      },
      {
        name: 'of',
        value: 'Schema',
        defaultValue: '-',
        comment: <>Nested definition following the same rules. <b>Required for type</b></>
      },
    ]
  },
  {
    type: 'enum',
    tokens: [
      {
        name: 'values',
        value: 'Array of unique values',
        defaultValue: '-',
        comment: <>Enum values. <b>Required for type</b></>
      }
    ]
  }
];

function AdvancedReactSettings() {
  const { values, setFieldValue } = useFormikContext();
  const dumpMakesSense = !!(values[fieldNames.singleEntityTemplate] || values[fieldNames.entityListTemplate]);
  const [syntaxRulesOpen, setSyntaxRulesOpen] = useState(false);

  return (
    <>
      <CheckboxField label='Perform fuzz-testing' name={fieldNames.hasFuzzing} />
      {dumpMakesSense && (
        <Box mt={2}>
          <HelpBadge helpText='Upload data to the server before testing'>
            <Typography variant='h6'>Data dump</Typography>
          </HelpBadge>
          <Box display='flex' alignItems='center' columnGap={1}>
            <Typography>Raw data</Typography>
            <Switch
              checked={values[fieldNames.dumpIsTemplate]}
              onChange={e => setFieldValue(fieldNames.dumpIsTemplate, e.target.checked)}
            />
            <HelpBadge helpText='Data will be randomly generated based on the rules you enter'>
              <Typography>Template</Typography>
            </HelpBadge>
          </Box>
          {!values[fieldNames.dumpIsTemplate] ? (
            <Box color='warning.main' display='flex' alignItems='center' mb={1} columnGap={1}>
              <WarningAmber />
              <Typography>
                Data will be uploaded to the database as is. Make sure it's an array of proper entries
              </Typography>
            </Box>
          ) : (
            <Button variant='text' onClick={() => setSyntaxRulesOpen(true)} sx={{ mb: 1 }}>
              Syntax rules
            </Button>
          )}
          <Dialog open={syntaxRulesOpen} onClose={() => setSyntaxRulesOpen(false)} fullWidth>
            <DialogTitle>
              Syntax rules for data dump templates
            </DialogTitle>
            <DialogContent>
              <Stack direction='column' spacing={2}>
                <Typography>
                  Each field in the template is a Schema defining how the value for this field should be generated.{' '}
                  Six types are supported, and for each you can use several tokens to add constraints. There's also
                  a{' '}
                  common token: <b>"nullable"</b>. It should be set to a Boolean, telling whether the field value
                  can{' '}
                  be a Null.
                </Typography>

                {SYNTAX_RULES.map(rule => (
                  <Box key={rule.type}>
                    <Typography mb={0.5}>Type: <b>{rule.type}</b></Typography>
                    {rule.tokens ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Token name</TableCell>
                              <TableCell>Token value</TableCell>
                              <TableCell>Default value</TableCell>
                              <TableCell>Comment</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rule.tokens.map(token => (
                              <TableRow key={token.name}>
                                <TableCell>{token.name}</TableCell>
                                <TableCell>{token.value}</TableCell>
                                <TableCell>{token.defaultValue}</TableCell>
                                <TableCell>{token.comment}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : <Typography component='i'>No specific tokens</Typography>}
                  </Box>
                ))}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSyntaxRulesOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          <Box width={180}>
            <FileField accept={fieldAccepts[fieldNames.fileDump]} name={fieldNames.fileDump} />
          </Box>
        </Box>
      )}
    </>
  );
}

export default AdvancedReactSettings;
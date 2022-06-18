import Layout from '../../../../../uiKit/Layout';
import MuiLink from '@mui/material/Link';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { useState } from 'react';


const SYNTAX_RULES = [
  {
    type: 'string',
    tokens: [
      {
        name: 'max',
        value: 'Positive Integer',
        defaultValue: '3',
        comment: 'Maximum length of the string'
      },
      {
        name: 'min',
        value: 'Non-negative Integer',
        defaultValue: '30',
        comment: 'Minimum length of the string'
      },
      {
        name: 'unique',
        value: 'Boolean',
        defaultValue: 'false',
        comment:
          <>
            <p>Value will be unique across the nearest Array-like. Here are two examples:</p>
            <Layout.Code my={0.5} component='code' large>
              {
                '{\n\t"hobbies": {' +
                '\n\t\t"type": "array": ' +
                '\n\t\t"of": {' +
                '\n\t\t\t"type": "string",' +
                '\n\t\t\t"unique": true' +
                '\n\t\t}' +
                '\n\t}' +
                '\n}'
              }
            </Layout.Code>
            <p>Each entry in the dump will have "hobbies" consisting of unique strings</p>
            <Layout.Code my={0.5} component='code' large>
              {
                '{\n\t"username": {' +
                '\n\t\t"type": "string",' +
                '\n\t\t"unique": true' +
                '\n\t}' +
                '\n}'
              }
            </Layout.Code>
            <p>Each entry in the dump will have a unique "username"</p>
          </>,
      },
      {
        name: 'letterSets',
        value: 'A subset of ["latin", "numbers", "symbols", "spaces", "nonLatin"]',
        defaultValue: '["latin"]',
        comment: 'The character sets to use when generating strings. ' +
          '"symbols" stands for all the various brackets, punctuation and math operators, ' +
          '"spaces" is for whitespaces, tabs and newlines, ' +
          '"nonLatin" includes cyrillic letters'
      },
      {
        name: 'allowCapital',
        value: 'Boolean',
        defaultValue: 'false',
        comment: 'Should capital letters be used'
      },
      {
        name: 'email',
        value: 'Boolean',
        defaultValue: 'false',
        comment: 'Should the string be an email. ' +
          'Fixes "max" = 100, "min" = 15, "unique" = true, "letterSets" = ["latin"], "allowCapital" = false'
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
        comment: 'Maximum value'
      },
      {
        name: 'min',
        value: 'Number',
        defaultValue: '-1000',
        comment: 'Minimum value'
      },
      {
        name: 'int',
        value: 'Boolean',
        defaultValue: 'false',
        comment: 'Should the number be an Integer'
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
          <>
            See{' '}
            <MuiLink href='https://momentjs.com/docs/#/displaying/format/'>
              Moment.js formats documentation
            </MuiLink>
          </>
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
        defaultValue: 'true',
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
        value: 'Positive Integer',
        defaultValue: '60',
        comment: 'Maximum size of the array'
      },
      {
        name: 'min',
        value: 'Non-negative Integer',
        defaultValue: '1',
        comment: 'Minimum size of the array'
      },
      {
        name: 'of',
        value: 'Schema',
        defaultValue: '-',
        comment: <>Nested Schema definition following the same rules. <b>Required for type</b></>
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
      },
      {
        name: 'unique',
        value: 'Boolean',
        defaultValue: 'false',
        comment: 'Same logic as for strings. Not allowed at top level (only for nested arrays). Trims "max" of the ' +
          'parent array to the length of "values"'
      }
    ]
  }
];

function DumpSyntaxModal() {
  const [syntaxRulesOpen, setSyntaxRulesOpen] = useState(false);

  return (
    <>
      <Dialog open={syntaxRulesOpen} onClose={() => setSyntaxRulesOpen(false)} fullWidth>
        <DialogTitle>
          Syntax rules for data dump templates
        </DialogTitle>
        <DialogContent>
          <Stack direction='column' spacing={2}>
            <Typography>
              Dump template allows you to describe the information about a single entity you expect to be present at
              Entity List and Single Entity pages. The test engine will generate a large set of such entities with
              randomized field values and upload it to the server before running tests.
            </Typography>
            <Typography>
              Each field in the template is a Schema defining how the value for this field should be generated.
              Six types are supported, and for each you can use several tokens to add constraints. There's also
              a common token: "nullable". It should be set to a Boolean, telling whether the field value
              can be a Null.
            </Typography>

            {SYNTAX_RULES.map(rule => (
              <Box key={rule.type}>
                <Typography mb={0.5}>Type: <b>{rule.type}</b></Typography>
                {rule.tokens ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 100 }}>Token name</TableCell>
                          <TableCell sx={{ width: 120 }}>Token value</TableCell>
                          <TableCell sx={{ width: 150 }}>Default value</TableCell>
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

            <Typography>
              You can combine these types and tokens to define fields that are objects themselves. Here's an
              example:
            </Typography>
            <Layout.Code component='code' large>
              {
                '{\n\t"user": {' +
                '\n\t\t"type": {' +
                '\n\t\t\t"username": {' +
                '\n\t\t\t\t"type": "string",' +
                '\n\t\t\t\t"unique": true' +
                '\n\t\t\t},' +
                '\n\t\t\t"age": {' +
                '\n\t\t\t\t"type": "number",' +
                '\n\t\t\t\t"int": true' +
                '\n\t\t\t},' +
                '\n\t\t}' +
                '\n\t}' +
                '\n}'
              }
            </Layout.Code>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyntaxRulesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Button variant='text' onClick={() => setSyntaxRulesOpen(true)} sx={{ mb: 1 }}>
        View syntax rules hint
      </Button>
    </>
  );
}

export default DumpSyntaxModal;
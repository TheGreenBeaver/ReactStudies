import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { arrayOf, string } from 'prop-types';
import { ElementRule } from '../../../../util/types';
import Box from '@mui/material/Box';
import Layout from '../../../../uiKit/Layout';


function ElementRulesTable({
  rules,
  contentHeader,
  contentEmptyString,
  tagHeader,
  tagEmptyString
}) {
  function getTagDisplay(tag) {
    if (!tag) {
      return <i>{tagEmptyString}</i>;
    }
    return <Layout.Code component='code'>{`<${tag}>`}</Layout.Code>;
  }

  function getContentDisplay(content) {
    if (!content) {
      return <i>{contentEmptyString}</i>;
    }
    return (
      <Box display='flex' columnGap={0.5} rowGap={0.25} flexWrap='wrap'>
        {content.map((block, idx) => (
          <Layout.Code component='span' key={idx}>{block}</Layout.Code>
        ))}
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              {tagHeader}
            </TableCell>
            <TableCell>
              {contentHeader}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rules.map(rule => (
            <TableRow key={rule.id}>
              <TableCell>
                {getTagDisplay(rule.tag)}
              </TableCell>
              <TableCell>
                {getContentDisplay(rule.content)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

ElementRulesTable.propTypes = {
  rules: arrayOf(ElementRule).isRequired,
  contentHeader: string.isRequired,
  contentEmptyString: string.isRequired,
  tagHeader: string.isRequired,
  tagEmptyString: string.isRequired
};

export default ElementRulesTable;
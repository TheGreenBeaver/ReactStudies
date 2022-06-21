import { object } from 'prop-types';
import Typography from '@mui/material/Typography';


function ReactResultDetails({
  result: {
    reactResult: {
      failedAt,
      singleDataPercentage,
      singleDumpPercentage,
      listDataPercentage,
      listDumpPercentage
    }
  }
}) {
  return (
    <>
      {failedAt && <Typography>Test failed: {failedAt}</Typography>}
      {listDataPercentage && <Typography>Endpoints data coverage for Entity List: {listDataPercentage}%</Typography>}
      {listDumpPercentage && <Typography>Dump coverage for Entity List: {listDumpPercentage}%</Typography>}
      {singleDataPercentage && <Typography>Endpoints data coverage for Single Entity: {singleDataPercentage}%</Typography>}
      {singleDumpPercentage && <Typography>Dump coverage for Single Entity: {singleDumpPercentage}%</Typography>}
    </>
  );
}

ReactResultDetails.propTypes = {
  result: object.isRequired,
};

export default ReactResultDetails;
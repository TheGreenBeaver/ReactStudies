import { string, func, object, instanceOf } from 'prop-types';
import usePromise from '../../../hooks/usePromise';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import { DEFAULT_PAGINATED_DATA } from '../../../util/constants';
import withCache from '../../../hofs/withCache';
import useDeferredFunction from '../../../hooks/useDeferredFunction';
import TextField from '@mui/material/TextField';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useFetch from '../../../hooks/useFetch';
import EndpointService from '../../../api/EndpointService';


// Combine data if new page fetched, replace otherwise (new q)
const getData = ({ data: newData }, currData) => newData.prev === null ? newData : {
  ...newData, results: [...currData.results, ...newData.results],
};
const manualReasons = ['input', 'clear'];

function EntityAutocompleteField({ name, label, getOptionLabel, extraParams, service, margin, renderOption }) {
  // Empty results if no q is provided
  const listEntities = useCallback(withCache((page, q) => q ? service.list({
    params: { page, q, ...extraParams },
  }) : Promise.resolve({ data: DEFAULT_PAGINATED_DATA })), [extraParams, service]);
  const { handler, isProcessing, data } = usePromise(listEntities, {
    initialData: DEFAULT_PAGINATED_DATA, getData
  });

  const { isSubmitting } = useFormikContext();
  const [{ value },, { setValue }] = useField(name);
  const [textValue, setTextValue] = useState('');
  const [fullValue, setFullValue] = useState(null);
  const changeReasonRef = useRef('');

  const updateCount = useRef(0);
  const shouldFetchSingleEntity = useCallback(entityId => updateCount.current++ < 2 && !!entityId, []);
  const fetchSingleEntity = useCallback(withCache(id => service.retrieve(id, {
    params: { mini: true } })
  ), [service]);
  const [, isFetchingSingleEntity] = useFetch(fetchSingleEntity, {
    deps: [value],
    initialData: null,
    shouldFetch: shouldFetchSingleEntity,
    onSuccess: setFullValue
  });

  const [scrollBoxProps, resetPage] = useInfiniteScroll(
    currentPage => handler(currentPage, textValue),
    !isProcessing && data.next != null
  );
  const updateOptions = useDeferredFunction((...args) => {
    handler(...args).then(resetPage);
  });

  useEffect(() => {
    if (!value) {
      setFullValue(null);
      changeReasonRef.current = '';
      setTextValue('');
    }
  }, [value]);

  useEffect(() => {
    if (manualReasons.includes(changeReasonRef.current)) {
      updateOptions(1, textValue);
    }
  }, [textValue]);

  const renderInput = useCallback(
    params => <TextField {...params} margin={margin} size='small' label={label} />, [label, margin]
  );

  return (
    <Autocomplete
      renderInput={renderInput}
      options={data.results}
      filterOptions={allOptions => allOptions}
      getOptionLabel={getOptionLabel}
      inputValue={textValue}
      loading={isProcessing}
      value={fullValue}
      disabled={isSubmitting || isFetchingSingleEntity}
      ListboxProps={scrollBoxProps}
      freeSolo
      renderOption={renderOption}
      onInputChange={(_, newTextValue, changeReason) => {
        changeReasonRef.current = changeReason;
        setTextValue(newTextValue);
      }}
      onChange={(_, newValue) => {
        setFullValue(newValue);
        setValue(newValue?.id);
      }}
    />
  )
}

EntityAutocompleteField.propTypes = {
  name: string.isRequired,
  label: string,
  getOptionLabel: func.isRequired,
  extraParams: object,
  service: instanceOf(EndpointService).isRequired,
  margin: string,
  renderOption: func
};

EntityAutocompleteField.defaultProps = {
  margin: 'normal',
};

export default EntityAutocompleteField;
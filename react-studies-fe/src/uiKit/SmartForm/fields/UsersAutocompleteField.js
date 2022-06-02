import { bool, string } from 'prop-types';
import usePromise from '../../../hooks/usePromise';
import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../api';
import { useField } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';
import { DEFAULT_PAGINATED_DATA } from '../../../util/constants';
import withCache from '../../../hofs/withCache';
import useDeferredFunction from '../../../hooks/useDeferredFunction';
import { TextField } from '@mui/material';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import useFetch from '../../../hooks/useFetch';


// Combine data if new page fetched, replace otherwise (new q)
const getData = ({ data: newData }, currData) => newData.prev === null ? newData : {
  ...newData, results: [...currData.results, ...newData.results],
};
const fetchSingleUser = withCache(id => api.users.retrieve(id, { params: { mini: true } }));
const manualReasons = ['input', 'clear'];

function UsersAutocompleteField({ name, label, isTeacher }) {
  // Empty results if no q is provided
  const listUsers = useCallback(withCache((page, q) => q ? api.users.list({
    params: { page, q, isTeacher },
  }) : Promise.resolve({ data: DEFAULT_PAGINATED_DATA })), [isTeacher]);
  const { handler, isProcessing, data } = usePromise(listUsers, {
    initialData: DEFAULT_PAGINATED_DATA, getData
  });

  const [{ value },, { setValue }] = useField(name);
  const [textValue, setTextValue] = useState('');
  const [fullValue, setFullValue] = useState(null);
  const changeReasonRef = useRef('');

  const updateCount = useRef(0);
  const shouldFetchSingleUser = useCallback((userId) => updateCount.current++ < 2 && !!userId, []);
  const [, isFetchingSingleUser] = useFetch(fetchSingleUser, {
    deps: [value],
    initialData: null,
    shouldFetch: shouldFetchSingleUser,
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

  return (
    <Autocomplete
      renderInput={params => <TextField {...params} margin='normal' size='small' label={label} />}
      options={data.results}
      filterOptions={allOptions => allOptions}
      getOptionLabel={user => `${user.firstName} ${user.lastName}`}
      inputValue={textValue}
      loading={isProcessing}
      value={fullValue}
      disabled={isFetchingSingleUser}
      ListboxProps={scrollBoxProps}
      freeSolo
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

UsersAutocompleteField.propTypes = {
  name: string.isRequired,
  label: string,
  isTeacher: bool.isRequired
};

export default UsersAutocompleteField;
import { Redirect, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { parse } from 'query-string';
import isEqual from 'lodash/isEqual';


function withQueryParams(
  Component,
  fallbackLink,
  cleanup,
  parseOptions = { parseNumbers: true }
) {
  return props => {
    const { search } = useLocation();

    const [paginationParams, shouldRedirect] = useMemo(() => {
      const rawParams = parse(search, parseOptions);
      const _paginationParams = cleanup(rawParams);
      const _shouldRedirect = !isEqual(rawParams, _paginationParams);
      return [_paginationParams, _shouldRedirect];
    }, [search]);

    if (shouldRedirect) {
      return <Redirect to={fallbackLink.compose(paginationParams)} />;
    }

    return <Component {...paginationParams} {...props} />;
  }
}

export default withQueryParams;
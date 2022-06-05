import { Redirect, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { parse } from 'query-string';
import isEqual from 'lodash/isEqual';


function withQueryParams(
  Component,
  fallbackLink,
  cleanup, {
    parseOptions = { parseNumbers: true },
    plainFallback = false
  } = {}) {
  return props => {
    const { search } = useLocation();

    const [cleanParams, shouldRedirect] = useMemo(() => {
      const rawParams = parse(search, parseOptions);
      const _cleanParams = cleanup(rawParams);
      const _shouldRedirect = !isEqual(rawParams, _cleanParams);
      return [_cleanParams, _shouldRedirect];
    }, [search]);

    if (shouldRedirect) {
      return <Redirect to={plainFallback ? fallbackLink.path : fallbackLink.compose(cleanParams)} />;
    }

    return <Component {...cleanParams} {...props} />;
  }
}

export default withQueryParams;
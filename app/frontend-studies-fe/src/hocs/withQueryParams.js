import { Redirect, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { parse } from 'query-string';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';


function withQueryParams(
  Component,
  fallbackLink,
  cleanup, {
    parseOptions = { parseNumbers: true },
    params = []
  } = {}) {
  return props => {
    const { search } = useLocation();
    const allParams = useParams();

    const [cleanParams, shouldRedirect] = useMemo(() => {
      const rawParams = parse(search, parseOptions);
      const _cleanParams = cleanup(rawParams);
      const _shouldRedirect = !isEqual(rawParams, _cleanParams);
      return [_cleanParams, _shouldRedirect];
    }, [search]);

    if (shouldRedirect) {
      return <Redirect to={fallbackLink.compose(...Object.values(pick(allParams, params)), cleanParams)} />;
    }

    return <Component {...cleanParams} {...props} />;
  }
}

export default withQueryParams;
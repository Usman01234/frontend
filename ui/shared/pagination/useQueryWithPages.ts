import type { UseQueryResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import omit from 'lodash/omit';
import { useRouter } from 'next/router';
import React, { useCallback } from 'react';
import { animateScroll } from 'react-scroll';

import type { PaginationParams } from './types';

import type { PaginatedResources, PaginationFilters, PaginationSorting, ResourceError, ResourcePayload } from 'lib/api/resources';
import { RESOURCES, SORTING_FIELDS } from 'lib/api/resources';
import type { Params as UseApiQueryParams } from 'lib/api/useApiQuery';
import useApiQuery from 'lib/api/useApiQuery';
import getQueryParamString from 'lib/router/getQueryParamString';

export interface Params<Resource extends PaginatedResources> {
  resourceName: Resource;
  options?: UseApiQueryParams<Resource>['queryOptions'];
  pathParams?: UseApiQueryParams<Resource>['pathParams'];
  filters?: PaginationFilters<Resource>;
  sorting?: PaginationSorting<Resource>;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

type NextPageParams = {
  block_number?: number;
  items_count: number;
  world?: string;
  table_id?: string;
  key0?: string;
  key1?: string;
  key_bytes?: string;
  [key: string]: any; // Allow additional dynamic properties
};

function getPaginationParamsFromQuery(queryString: string | Array<string> | undefined): NextPageParams | {} {
  if (queryString) {
    try {
      return JSON.parse(decodeURIComponent(getQueryParamString(queryString))) as NextPageParams; // Ensure return type
    } catch (error) {
      console.error('Error parsing query params:', error);
    }
  }
  return {}; // Return an empty object as a fallback
}

function getNextPageParams<R extends PaginatedResources>(
  data: ResourcePayload<R> | undefined,
): NextPageParams | null {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !('next_page_params' in data)) {
    return null;
  }
  return data.next_page_params as NextPageParams || null;
}

export type QueryWithPagesResult<Resource extends PaginatedResources> = UseQueryResult<ResourcePayload<Resource>, ResourceError<unknown>> & {
  onFilterChange: <R extends PaginatedResources = Resource>(filters: PaginationFilters<R>) => void;
  onSortingChange: (sorting?: PaginationSorting<Resource>) => void;
  pagination: PaginationParams;
}

export default function useQueryWithPages<Resource extends PaginatedResources>({
  resourceName,
  filters,
  sorting,
  options,
  pathParams,
  scrollRef,
}: Params<Resource>): QueryWithPagesResult<Resource> {
  const resource = RESOURCES[resourceName];
  const queryClient = useQueryClient();
  const router = useRouter();

  const [ page, setPage ] = React.useState<number>(router.query.page && !Array.isArray(router.query.page) ? Number(router.query.page) : 1);

  // Ensure that the initialParams variable is of type NextPageParams
  const initialParams: NextPageParams = getPaginationParamsFromQuery(router.query.next_page_params) as NextPageParams;

  // Ensure the initial state for pageParams contains only NextPageParams
  const [ pageParams, setPageParams ] = React.useState<Record<number, NextPageParams>>({
    [page]: initialParams, // This now has a compatible type
  });

  const [ hasPages, setHasPages ] = React.useState(page > 1);

  const isMounted = React.useRef(false);
  const queryParams = { ...pageParams[page], ...filters, ...sorting };

  const scrollToTop = useCallback(() => {
    scrollRef?.current ? scrollRef.current.scrollIntoView(true) : animateScroll.scrollToTop({ duration: 0 });
  }, [ scrollRef ]);

  const queryResult = useApiQuery(resourceName, {
    pathParams,
    queryParams: Object.keys(queryParams).length ? queryParams : undefined,
    queryOptions: {
      staleTime: page === 1 ? 0 : Infinity,
      ...options,
    },
  });

  const { data } = queryResult;
  const nextPageParams = getNextPageParams(data);

  const onNextPageClick = useCallback(() => {
    if (!nextPageParams) {
      return; // Hide next page button if no next_page_params
    }

    setPageParams((prev) => ({
      ...prev,
      [page + 1]: nextPageParams,
    }));
    setPage((prev) => prev + 1);

    const nextPageQuery = {
      ...router.query,
      page: String(page + 1),
      next_page_params: encodeURIComponent(JSON.stringify(nextPageParams)),
    };

    setHasPages(true);
    scrollToTop();
    router.push({ pathname: router.pathname, query: nextPageQuery }, undefined, { shallow: true });
  }, [ nextPageParams, page, router, scrollToTop ]);

  const onPrevPageClick = useCallback(() => {
    let nextPageQuery: typeof router.query = { ...router.query };
    if (page === 2) {
      nextPageQuery = omit(router.query, [ 'next_page_params', 'page' ]);
    } else {
      nextPageQuery.next_page_params = encodeURIComponent(JSON.stringify(pageParams[page - 1]));
      nextPageQuery.page = String(page - 1);
    }

    scrollToTop();
    router.push({ pathname: router.pathname, query: nextPageQuery }, undefined, { shallow: true })
      .then(() => {
        setPage((prev) => prev - 1);
        if (page === 2) {
          queryClient.removeQueries({ queryKey: [ resourceName ] });
        }
      });
  }, [ router, page, pageParams, scrollToTop, queryClient, resourceName ]);

  const resetPage = useCallback(() => {
    queryClient.removeQueries({ queryKey: [ resourceName ] });

    scrollToTop();
    const nextRouterQuery = omit(router.query, [ 'next_page_params', 'page' ]);
    router.push({ pathname: router.pathname, query: nextRouterQuery }, undefined, { shallow: true }).then(() => {
      queryClient.removeQueries({ queryKey: [ resourceName ] });
      setPage(1);
      setPageParams({ '1': {} as NextPageParams }); // Reset to initial state
      window.setTimeout(() => {
        queryClient.removeQueries({ queryKey: [ resourceName ], type: 'inactive' });
      }, 100);
    });
  }, [ queryClient, resourceName, router, scrollToTop ]);

  const onFilterChange = useCallback(<R extends PaginatedResources = Resource>(newFilters: PaginationFilters<R> | undefined) => {
    const newQuery = omit<typeof router.query>(router.query, 'next_page_params', 'page', 'filterFields' in resource ? resource.filterFields : []);
    if (newFilters) {
      Object.entries(newFilters).forEach(([ key, value ]) => {
        const isValidValue = typeof value === 'boolean' || (value && value.length);
        if (isValidValue) {
          newQuery[key] = Array.isArray(value) ? value.join(',') : (String(value) || '');
        }
      });
    }
    scrollToTop();
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true },
    ).then(() => {
      setHasPages(false);
      setPage(1);
      setPageParams({ '1': {} as NextPageParams }); // Reset to initial state
    });
  }, [ router, resource, scrollToTop ]);

  const onSortingChange = useCallback((newSorting: PaginationSorting<Resource> | undefined) => {
    const newQuery = {
      ...omit<typeof router.query>(router.query, 'next_page_params', 'page', SORTING_FIELDS),
      ...newSorting,
    };
    scrollToTop();
    router.push(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      { shallow: true },
    ).then(() => {
      setHasPages(false);
      setPage(1);
      setPageParams({ '1': {} as NextPageParams }); // Reset to initial state
    });
  }, [ router, scrollToTop ]);

  const hasNextPage = nextPageParams ? Object.keys(nextPageParams).length > 0 : false;

  const pagination = {
    page,
    onNextPageClick,
    onPrevPageClick,
    resetPage,
    hasPages,
    hasNextPage,
    canGoBackwards: Boolean(pageParams[page - 1]),
    isLoading: queryResult.isPlaceholderData,
    isVisible: hasPages || hasNextPage,
  };

  React.useEffect(() => {
    if (page !== 1 && isMounted.current) {
      queryClient.cancelQueries({ queryKey: [ resourceName ] });
      setPage(1);
    }
  }, [ resourceName, page, queryClient ]);

  React.useEffect(() => {
    if (isMounted.current) {
      setPageParams((prev) => ({
        ...prev,
        [page]: nextPageParams || {} as NextPageParams,
      }));
    }
  }, [ nextPageParams, page ]);

  React.useEffect(() => {
    isMounted.current = true;
  }, []);

  return { ...queryResult, onFilterChange, onSortingChange, pagination };
}

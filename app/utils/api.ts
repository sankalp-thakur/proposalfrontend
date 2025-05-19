import { useState, useEffect } from 'react';
import useSWR from 'swr';

const DEFAULT_OPTIONS = {
  retries: 3,
  retryDelay: 1000,
  cacheTime: 5 * 60 * 1000, // 5 minutes
};

const cache = new Map();

/**
 * Enhanced fetch function with retry logic
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with the fetch response
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit & { retries?: number; retryDelay?: number } = {}
): Promise<Response> => {
  const { retries = DEFAULT_OPTIONS.retries, retryDelay = DEFAULT_OPTIONS.retryDelay, ...fetchOptions } = options;
  
  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    return fetchWithRetry(url, {
      ...fetchOptions,
      retries: retries - 1,
      retryDelay: retryDelay * 2,
    });
  }
};

/**
 * Fetch with caching
 * @param url - The URL to fetch
 * @param options - Fetch options including cache time
 * @returns Promise with the parsed JSON response
 */
export const fetchWithCache = async (
  url: string,
  options: RequestInit & { cacheTime?: number } = {}
): Promise<any> => {
  const { cacheTime = DEFAULT_OPTIONS.cacheTime, ...fetchOptions } = options;
  
  const cachedData = cache.get(url);
  if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
    return cachedData.data;
  }
  
  const response = await fetchWithRetry(url, fetchOptions);
  const data = await response.json();
  
  cache.set(url, {
    data,
    timestamp: Date.now(),
  });
  
  return data;
};

/**
 * Fetch with pagination
 * @param url - The base URL to fetch
 * @param options - Fetch options including pagination parameters
 * @returns Promise with the paginated response
 */
export const fetchWithPagination = async (
  url: string,
  options: RequestInit & { 
    page?: number; 
    pageSize?: number;
    pageParam?: string;
    pageSizeParam?: string;
  } = {}
): Promise<any> => {
  const { 
    page = 1, 
    pageSize = 10,
    pageParam = 'page',
    pageSizeParam = 'pageSize',
    ...fetchOptions 
  } = options;
  
  const separator = url.includes('?') ? '&' : '?';
  const paginatedUrl = `${url}${separator}${pageParam}=${page}&${pageSizeParam}=${pageSize}`;
  
  return fetchWithCache(paginatedUrl, fetchOptions);
};

/**
 * React hook for data fetching with SWR
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns SWR response with data, error, and loading state
 */
export const useApi = (url: string, options: any = {}) => {
  return useSWR(
    url, 
    () => fetchWithCache(url, options), 
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      ...options.swr
    }
  );
};

/**
 * React hook for paginated data fetching
 * @param url - The base URL to fetch
 * @param options - Fetch options including pagination parameters
 * @returns Object with paginated data, loading state, error, and pagination controls
 */
export const usePaginatedApi = (
  url: string, 
  options: any = {}
) => {
  const [page, setPage] = useState(options.page || 1);
  const [pageSize, setPageSize] = useState(options.pageSize || 10);
  
  const { data, error, isValidating, mutate } = useApi(
    url ? `${url}${url.includes('?') ? '&' : '?'}${options.pageParam || 'page'}=${page}&${options.pageSizeParam || 'pageSize'}=${pageSize}` : '',
    options
  );
  
  const goToPage = (newPage: number) => {
    setPage(newPage);
  };
  
  const nextPage = () => {
    setPage(prev => prev + 1);
  };
  
  const prevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };
  
  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  };
  
  return {
    data,
    error,
    isLoading: isValidating,
    pagination: {
      page,
      pageSize,
      goToPage,
      nextPage,
      prevPage,
      changePageSize,
    },
    refresh: mutate,
  };
};

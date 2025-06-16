
import { useState, useEffect, useMemo } from "react";

interface UsePaginationProps {
  items: any[];
  itemsPerPage: number;
}

export const usePagination = ({ items, itemsPerPage }: UsePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const paginatedItems = useMemo(() => {
    return items.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [items, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const getPaginationGroup = () => {
    const pageCount = totalPages;
    const currentPageNumber = currentPage;
    const maxPagesToShow = 5;

    if (pageCount <= maxPagesToShow) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(2, currentPageNumber - half);
    let end = Math.min(pageCount - 1, currentPageNumber + half);

    if (currentPageNumber - half < 2) {
      end = maxPagesToShow - 1;
    }
    
    if (currentPageNumber + half > pageCount - 2) {
      start = pageCount - maxPagesToShow + 2;
    }

    pages.push(1);
    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < pageCount - 1) {
      pages.push('...');
    }
    pages.push(pageCount);

    return pages;
  };

  return {
    currentPage,
    totalPages,
    paginatedItems,
    handlePageChange,
    getPaginationGroup
  };
};

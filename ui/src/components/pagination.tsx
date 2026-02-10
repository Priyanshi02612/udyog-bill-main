"use client";

import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { Button } from "./ui/button";

interface PaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export default function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPages = () => {
    const pages: (number | "...")[] = [];

    const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const renderBackButton = () => {
    return (
      <Button
        variant="icon"
        disabled={currentPage === 1}
        leadingIcon={<MdChevronLeft className="w-6 h-6" />}
        className="shadow-none rounded-md disabled:bg-gray-200 disabled:text-gray-400"
        onClick={() => onPageChange(currentPage - 1)}
      />
    );
  };

  const renderNextButton = () => {
    return (
      <Button
        variant="icon"
        disabled={currentPage === totalPages}
        leadingIcon={<MdChevronRight className="w-6 h-6" />}
        className="shadow-none rounded-md disabled:bg-gray-200 disabled:text-gray-400"
        onClick={() => onPageChange(currentPage + 1)}
      />
    );
  };

  return (
    <div className="mt-2 px-8 gap-3 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
      <p className="text-sm text-[#c08f79] text-center md:text-left">
        Showing <span className="font-bold">{startItem}</span> to{" "}
        <span className="font-bold">{endItem}</span> of{" "}
        <span className="font-bold">{totalItems}</span> items
      </p>

      {/* Mobile */}
      <div className="flex items-center justify-center gap-3 md:hidden">
        {renderBackButton()}

        <span className="text-sm font-medium text-[#0d161b]">
          {currentPage} / {totalPages}
        </span>

        {renderNextButton()}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2">
        {renderBackButton()}

        {getPages().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-1 text-slate-400">
              ...
            </span>
          ) : (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "primary" : "outline-secondary"}
              onClick={() => onPageChange(page)}
              className="shadow-none rounded-md"
            >
              {page}
            </Button>
          ),
        )}

        {renderNextButton()}
      </div>
    </div>
  );
}

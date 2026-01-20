import React, { useState } from 'react';
import { Button, Input, Select, LoadingSpinner } from '../UI';

interface Column {
    key: string;
    header: string;
    render?: (value: any, row: any) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    loading?: boolean;
    searchable?: boolean;
    pagination?: boolean;
    selectable?: boolean;
    actions?: (row: any) => React.ReactNode;
    onSearch?: (query: string) => void;
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    onSelectionChange?: (selectedIds: string[]) => void;
}

const DataTable: React.FC<DataTableProps> = ({
    columns,
    data,
    loading = false,
    searchable = true,
    pagination = true,
    selectable = false,
    actions,
    onSearch,
    onSort,
    onSelectionChange
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleSort = (columnKey: string) => {
        if (!columns.find(col => col.key === columnKey)?.sortable) return;

        const newDirection = sortColumn === columnKey && sortDirection === 'asc'
            ? 'desc'
            : 'asc';

        setSortColumn(columnKey);
        setSortDirection(newDirection);
        onSort?.(columnKey, newDirection);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = data.map(row => row.id);
            setSelectedRows(allIds);
            onSelectionChange?.(allIds);
        } else {
            setSelectedRows([]);
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (id: string) => {
        const newSelected = selectedRows.includes(id)
            ? selectedRows.filter(rowId => rowId !== id)
            : [...selectedRows, id];

        setSelectedRows(newSelected);
        onSelectionChange?.(newSelected);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    // Pagination
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = pagination ? data.slice(startIndex, endIndex) : data;

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">Data Table</h3>
                        <p className="text-sm text-gray-600">
                            Showing {data.length} records
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {searchable && (
                            <div className="w-full sm:w-64">
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    icon="search"
                                />
                            </div>
                        )}

                        {selectable && selectedRows.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {selectedRows.length} selected
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        // Bulk actions
                                    }}
                                >
                                    Bulk Actions
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            {selectable && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.length === data.length && data.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                            )}

                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    style={{ width: column.width }}
                                >
                                    <div className="flex items-center">
                                        <span>{column.header}</span>
                                        {column.sortable && (
                                            <button
                                                onClick={() => handleSort(column.key)}
                                                className="ml-2 text-gray-400 hover:text-gray-600"
                                            >
                                                <i className={`fas fa-sort ${sortColumn === column.key
                                                        ? 'text-blue-500'
                                                        : ''
                                                    }`}></i>
                                            </button>
                                        )}
                                    </div>
                                </th>
                            ))}

                            {actions && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className={`hover:bg-gray-50 ${selectedRows.includes(row.id) ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    {selectable && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(row.id)}
                                                onChange={() => handleSelectRow(row.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                    )}

                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : row[column.key]}
                                        </td>
                                    ))}

                                    {actions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                {actions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    className="px-6 py-12 text-center"
                                >
                                    <div className="text-gray-500">
                                        <i className="fas fa-database text-4xl mb-4 opacity-50"></i>
                                        <p className="text-lg font-medium">No data found</p>
                                        <p className="text-sm mt-1">
                                            {searchQuery ? 'Try adjusting your search' : 'No records available'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && data.length > 0 && (
                <div className="px-6 py-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length}
                            </span>

                            <Select
                                value={rowsPerPage.toString()}
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                className="w-20"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                icon="chevron-left"
                            >
                                Previous
                            </Button>

                            <div className="flex gap-1">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {totalPages > 5 && currentPage < totalPages - 2 && (
                                    <>
                                        <span className="px-2 py-2">...</span>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium ${currentPage === totalPages
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                icon="chevron-right"
                                iconPosition="right"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;

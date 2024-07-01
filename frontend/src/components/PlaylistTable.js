import React from 'react';
import { useTable, useSortBy } from 'react-table';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { columns } from './TableColumns';

const PlaylistTable = ({ data }) => {
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    return (
        <table {...getTableProps()} className="table">
            <thead>
                {headerGroups.map(headerGroup => {
                    const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                    return (
                        <tr key={headerGroupKey} {...headerGroupProps}>
                            {headerGroup.headers.map(column => {
                                const { key: columnKey, ...columnProps } = column.getHeaderProps(column.getSortByToggleProps());
                                return (
                                    <th key={columnKey} {...columnProps}>
                                        {column.render('Header')}
                                        <span>
                                            {column.isSorted
                                                ? column.isSortedDesc
                                                    ? <FaArrowDown />
                                                    : <FaArrowUp />
                                                : ''}
                                        </span>
                                    </th>
                                );
                            })}
                        </tr>
                    );
                })}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    const { key: rowKey, ...rowProps } = row.getRowProps();
                    return (
                        <tr key={rowKey} {...rowProps}>
                            {row.cells.map(cell => {
                                const { key: cellKey, ...cellProps } = cell.getCellProps();
                                return (
                                    <td key={cellKey} {...cellProps}>
                                        {cell.render('Cell')}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default PlaylistTable;

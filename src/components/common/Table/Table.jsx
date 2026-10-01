import React from 'react';
import { Table as AntdTable } from 'antd';

export function Table({
  columns = [],
  data = [],
  dataSource,
  loading = false,
  isLoading,
  rowKey = 'id',
  pagination = { pageSize: 6 },
  onRowClick = null,
  ...props
}) {
  const rows = dataSource || data;

  // Format columns to ensure key is present
  const formattedColumns = columns.map((col) => ({
    ...col,
    title: col.title || col.header,
    dataIndex: col.dataIndex || col.key,
    key: col.key || col.dataIndex,
  }));

  return (
    <AntdTable
      columns={formattedColumns}
      dataSource={rows}
      rowKey={rowKey}
      loading={isLoading !== undefined ? isLoading : loading}
      pagination={pagination}
      onRow={(record) => ({
        onClick: () => onRowClick && onRowClick(record),
        style: onRowClick ? { cursor: 'pointer' } : {},
      })}
      {...props}
    />
  );
}

export default Table;

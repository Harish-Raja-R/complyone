import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Table = ({ headers, data, columns, renderCell, actions, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="table-wrapper">
        <table className="comply-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
              {actions && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={headers.length + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {renderCell ? renderCell(row, col) : (row[col] !== null && row[col] !== undefined ? String(row[col]) : '')}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} records
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
              disabled={currentPage === 1}
              onClick={handlePrevPage}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 12px' }}
              disabled={currentPage === totalPages}
              onClick={handleNextPage}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;

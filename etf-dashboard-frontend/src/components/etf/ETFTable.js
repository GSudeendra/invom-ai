import React from 'react';
import { Eye, CheckSquare } from 'lucide-react';
import { formatPrice, formatPercent } from '../../utils/format';

export default function ETFTable({ etfs, liveMode, selectedEtfs = [], onToggleSelect }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" disabled />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">NAV</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">1Y Return</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {etfs.map((etf, idx) => {
              const symbol = liveMode ? etf.symbol : etf.symbol || etf.amfiCode;
              const name = liveMode ? (etf.assets || etf.symbol) : (etf.schemeName || etf.name);
              const category = etf.category && etf.category !== 'N/A' ? etf.category : '-';
              const nav = liveMode ? etf.ltP : etf.latestNav || etf.nav;
              const return1Y = liveMode ? etf.yPC : etf.return1Y;
              const etfKey = symbol || idx;
              const isSelected = selectedEtfs.includes(etfKey);
              return (
                <tr key={etfKey} className={`hover:bg-gray-50 transition-colors duration-150 ${isSelected ? 'bg-primary-50' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(etfKey)}
                      className="form-checkbox h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{symbol || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs" title={name}>{name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{category}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{formatPrice(nav)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium {return1Y >= 0 ? 'text-success-600' : 'text-danger-600'}">
                    {return1Y !== undefined ? formatPercent(return1Y) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="btn btn-secondary text-xs" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className={`btn btn-secondary text-xs ml-2 ${isSelected ? 'bg-primary-100 text-primary-700' : ''}`}
                      title="Compare"
                      onClick={() => onToggleSelect(etfKey)}
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
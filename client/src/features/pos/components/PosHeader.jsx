import React, { useRef, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/store';
import { ROUTES } from '@/routes/routeConfig';

export function PosHeader({
  searchQuery,
  onSearchChange,
  onBarcodeScan,
  onOpenZReport,
}) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const user = useAppStore((state) => state.user);

  // Shift & Cashier display info
  const cashierName = user?.name || user?.full_name || user?.username || 'Dara Meas';
  const shiftTime = '08:02';

  // Hotkey listener: Press F2 to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDownInput = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onBarcodeScan) {
        onBarcodeScan(searchQuery.trim());
      }
    }
  };

  return (
    <header className="pos-header">
      {/* Left: Terminal Info */}
      <div className="pos-header-left">
        <button
          className="pos-back-btn"
          onClick={() => navigate(ROUTES.DASHBOARD)}
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="pos-terminal-badge">V</div>
        <div className="pos-terminal-info">
          <span className="pos-terminal-title">Terminal 2 · Main branch</span>
          <span className="pos-terminal-subtitle">
            Shift open {shiftTime} {cashierName}
          </span>
        </div>
      </div>

      {/* Center: Search & Barcode Input */}
      <div className="pos-header-center">
        <div className="pos-search-wrapper">
          <Search className="pos-search-icon" size={17} />
          <input
            ref={searchInputRef}
            type="text"
            className="pos-search-input"
            placeholder="Scan barcode or search product..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDownInput}
          />
          <span className="pos-search-badge">F2</span>
        </div>
      </div>

      {/* Right: Status & Shift Report */}
      <div className="pos-header-right">
        <div className="pos-status-pill">
          <span className="pos-status-dot" />
          <span>Online</span>
        </div>

        <button className="pos-shift-btn" onClick={onOpenZReport}>
          Shift · Z-report
        </button>
      </div>
    </header>
  );
}

export default PosHeader;

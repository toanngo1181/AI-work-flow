import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  onSelect: (iconName: string) => void;
  onClose: () => void;
  currentIcon?: string;
}

const POPULAR_ICONS = [
  'Activity', 'AlertTriangle', 'Anchor', 'Archive', 'ArrowRight', 'Award', 'BarChart', 
  'Battery', 'Bell', 'Book', 'Bookmark', 'Box', 'Briefcase', 'Calendar', 'Camera', 
  'Check', 'CheckCircle', 'ChevronRight', 'Circle', 'Clipboard', 'Clock', 'Cloud', 
  'Code', 'Coffee', 'Cog', 'Command', 'Compass', 'Copy', 'CreditCard', 'Database', 
  'Disc', 'DollarSign', 'Download', 'Edit', 'Eye', 'File', 'FileText', 'Filter', 
  'Flag', 'Folder', 'Gift', 'Globe', 'Grid', 'HardDrive', 'Hash', 'Headphones', 
  'Heart', 'Home', 'Image', 'Inbox', 'Info', 'Key', 'Layers', 'Layout', 'LifeBuoy', 
  'Link', 'List', 'Lock', 'Mail', 'Map', 'MapPin', 'Menu', 'MessageCircle', 
  'MessageSquare', 'Mic', 'Monitor', 'Moon', 'MoreHorizontal', 'Music', 'Package', 
  'Paperclip', 'Pause', 'PenTool', 'Percent', 'Phone', 'PieChart', 'Play', 
  'PlayCircle', 'Plus', 'Power', 'Printer', 'Radio', 'RefreshCw', 'Save', 'Search', 
  'Send', 'Server', 'Settings', 'Share', 'Shield', 'ShieldAlert', 'ShoppingBag', 
  'ShoppingCart', 'Smartphone', 'Smile', 'Speaker', 'Star', 'StopCircle', 'Sun', 
  'Tablet', 'Tag', 'Target', 'Terminal', 'ThumbsUp', 'Tool', 'Trash', 'Trash2', 
  'Truck', 'Tv', 'Type', 'Umbrella', 'Unlock', 'Upload', 'User', 'UserCheck', 
  'UserPlus', 'Users', 'Video', 'Voicemail', 'Volume', 'Volume2', 'Watch', 'Wifi', 
  'Wind', 'X', 'XCircle', 'Zap', 'ZoomIn'
];

const IconPicker: React.FC<IconPickerProps> = ({ onSelect, onClose, currentIcon }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = useMemo(() => {
    return POPULAR_ICONS.filter(name => 
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="absolute top-0 left-full ml-4 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-50 animate-in fade-in slide-in-from-left-4 h-[400px]">
      <div className="p-3 border-b border-slate-100 flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm icon..." 
            className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
          <X size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-5 gap-1 content-start">
        {filteredIcons.map((name) => {
          const Icon = (LucideIcons as any)[name];
          if (!Icon) return null;
          
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className={`p-2 rounded-lg flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors ${currentIcon === name ? 'bg-indigo-100 text-indigo-600 ring-1 ring-indigo-300' : 'text-slate-600'}`}
              title={name}
            >
              <Icon size={20} strokeWidth={2} />
            </button>
          );
        })}
        
        {filteredIcons.length === 0 && (
           <div className="col-span-5 text-center py-8 text-slate-400 text-xs">
              Không tìm thấy icon nào.
           </div>
        )}
      </div>
    </div>
  );
};

export default IconPicker;
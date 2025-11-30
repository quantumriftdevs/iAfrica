import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="group relative bg-white rounded-xl shadow-lg p-7 border border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-purple-50/0 group-hover:from-purple-50/50 group-hover:to-purple-50/30 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-grow">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</div>
          <div className="text-3xl font-bold mt-3 text-gray-900 group-hover:text-purple-700 transition-colors duration-200">{value}</div>
          {trend && (
            <div className={`text-sm mt-3 font-semibold flex items-center ${trend.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.type === 'increase' ? '↑' : '↓'} {trend.value}
            </div>
          )}
        </div>
        {Icon && (
          <div className="text-purple-500 group-hover:text-purple-600 transition-colors duration-300 ml-4">
            <div className="p-3 bg-purple-50 group-hover:bg-purple-100 rounded-xl transition-all duration-300">
              <Icon size={28} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

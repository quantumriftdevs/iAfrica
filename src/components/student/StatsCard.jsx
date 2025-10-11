import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-grow">
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className="text-2xl font-bold mt-2 text-gray-900">{value}</div>
          {trend && (
            <div className={`text-sm mt-2 ${trend.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </div>
          )}
        </div>
        {Icon && (
          <div className="text-blue-600">
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

import React from 'react';

const ConfirmModal = ({ open, title = 'Confirm', message = 'Are you sure?', onCancel, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

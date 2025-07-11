import React, { useState } from 'react';
import { createAdditionalWork } from '../lib/api';

interface AdditionalWorkButtonProps {
  selectedDate: string;
  onWorkAdded: () => void;
  className?: string;
}

const AdditionalWorkButton: React.FC<AdditionalWorkButtonProps> = ({
  selectedDate,
  onWorkAdded,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workplaceId: 0,
    startTime: '',
    endTime: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createAdditionalWork({
        workplaceId: formData.workplaceId,
        workDate: selectedDate,
        startTime: formData.startTime,
        endTime: formData.endTime
      });
      
      setIsModalOpen(false);
      setFormData({ workplaceId: 0, startTime: '', endTime: '' });
      onWorkAdded();
    } catch (error) {
      console.error('Failed to create additional work:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'workplaceId' ? parseInt(value) || 0 : value 
    }));
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors ${className}`}
      >
        <span className="text-lg">+</span>
        <span className="font-medium">추가 근무 등록</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">추가 근무 등록</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="workplaceId" className="block text-sm font-medium text-gray5 mb-1">
                  근무지
                </label>
                <select
                  id="workplaceId"
                  name="workplaceId"
                  value={formData.workplaceId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value={0}>근무지를 선택하세요</option>
                  <option value={1}>스타벅스 해운대점</option>
                  <option value={2}>카페 베네</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray5 mb-1">
                  시작 시간
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray5 mb-1">
                  종료 시간
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ workplaceId: 0, startTime: '', endTime: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray4 bg-gray1 rounded-md hover:bg-gray2 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? '등록 중...' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdditionalWorkButton;
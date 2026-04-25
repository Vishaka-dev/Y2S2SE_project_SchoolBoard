import React, { useState } from 'react';
import { X, Calendar, MapPin, Tag, Image as ImageIcon, ChevronRight, ChevronLeft, Send, Loader2, Clock } from 'lucide-react';
import { eventService } from '../services/eventService';

const CATEGORIES = [
  'ACADEMIC', 'SPORTS', 'ARTS', 'CULTURAL', 'HOLIDAY', 'MEETING', 'WORKSHOP', 'OTHER'
];

const CreateEventModal = ({ isOpen, onClose, onEventCreated }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'ACADEMIC'
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description || '');
      
      // Combine date and time into a single string for the backend
      // Backend expects YYYY-MM-DDTHH:mm:ss
      const combinedDateTime = `${formData.date}T${formData.time}:00`;
      data.append('eventDate', combinedDateTime); 
      
      data.append('location', formData.location);
      data.append('category', formData.category);
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      await eventService.createEvent(data);
      onEventCreated?.('Event scheduled successfully!', 'success');
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'ACADEMIC'
      });
      setSelectedFile(null);
      setImagePreview(null);
      setStep(1);
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('eventCreated'));
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-manrope">Schedule New Event</h2>
            <p className="text-xs text-gray-500 font-medium tracking-tight">Step {step} of 3</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" /> Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g., Annual Science Fair 2026"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 font-dm-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" /> Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-dm-sans"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-dm-sans"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.title || !formData.date || !formData.time}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> Location
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g., Main Auditorium or Zoom Link"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-dm-sans"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" /> Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-dm-sans appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.location}
                  className="flex-[2] py-3.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                  Almost there <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> Event Banner
                </label>
                
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => document.getElementById('event-image-upload').click()}
                >
                  {imagePreview ? (
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold text-sm">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50 hover:bg-white hover:border-blue-400 transition-all group/box">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover/box:scale-110">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">Click to upload banner</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG or JPEG (Max. 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  id="event-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Tell people more about the event..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-dm-sans resize-none"
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-lg shadow-blue-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Post Event <Send className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;

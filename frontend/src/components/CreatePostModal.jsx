import React, { useState } from 'react';
import { postService } from '../services/postService';

const CreatePostModal = ({ isOpen, onClose, onPostCompleted }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                if (onPostCompleted) onPostCompleted('Please upload a valid image file (JPEG, PNG, etc).', 'error');
                // Reset input so they can select again
                e.target.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                if (onPostCompleted) onPostCompleted('Image size should be less than 5MB.', 'error');
                e.target.value = '';
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation 
        if (!content.trim() && !image) {
            if (onPostCompleted) onPostCompleted('Please enter some text or upload an image to create a post.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            await postService.createPost({
                content: content.trim(),
                image: image
            });

            // Notify parent via Toast callback
            if (onPostCompleted) {
                onPostCompleted('Post created successfully!', 'success');
            }

            // Reset form and close instantly
            setContent('');
            setImage(null);
            setImagePreview('');
            setIsSubmitting(false);
            onClose();

        } catch (error) {
            if (onPostCompleted) {
                onPostCompleted('Failed to create post. Please try again.', 'error');
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 transition-opacity font-dm-sans">
            <div
                className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold font-manrope text-gray-900">Create a Post</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        disabled={isSubmitting}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 overflow-y-auto">
                    <div className="flex gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                            ME
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-semibold text-gray-900 text-sm">Your Name</span>
                            <span className="text-xs text-gray-500">Student</span>
                        </div>
                    </div>

                    <form id="create-post-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={4}
                                className="w-full bg-white border-0 py-2 text-base md:text-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none resize-none"
                                placeholder="What do you want to talk about?"
                                disabled={isSubmitting}
                                autoFocus
                            />
                        </div>

                        {/* Image Preview Container */}
                        {imagePreview && (
                            <div className="relative mt-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-md object-contain" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    disabled={isSubmitting}
                                    className="absolute top-4 right-4 p-1.5 bg-gray-900 bg-opacity-70 text-white rounded-full hover:bg-opacity-100 shadow-md transition-all"
                                    title="Remove image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center">
                        <label htmlFor="modal-image-upload" className="flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer transition-colors" title="Add a photo">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <input
                                id="modal-image-upload"
                                name="modal-image-upload"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleImageChange}
                                disabled={isSubmitting}
                            />
                        </label>
                    </div>

                    <button
                        form="create-post-form"
                        type="submit"
                        disabled={isSubmitting || (!content.trim() && !image)}
                        className="px-6 py-2 bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 font-medium rounded-full shadow-sm transition-colors disabled:opacity-50 disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-500 flex items-center gap-2 text-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Posting...
                            </>
                        ) : (
                            'Post'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreatePostModal;

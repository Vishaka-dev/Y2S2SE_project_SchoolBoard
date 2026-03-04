import React, { useState, useEffect } from 'react';
import { postService } from '../services/postService';

const EditPostModal = ({ isOpen, onClose, post, onPostCompleted }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load post data when modal opens
    useEffect(() => {
        if (post && isOpen) {
            setContent(post.content || '');
            setImagePreview(post.imageUrl || '');
            setImage(null);
        }
    }, [post, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                if (onPostCompleted) onPostCompleted('Please upload a valid image file.', 'error');
                e.target.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
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

        if (!content.trim() && !image && !imagePreview) {
            if (onPostCompleted) onPostCompleted('Post cannot be empty.', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            await postService.updatePost(post.id, {
                content: content.trim(),
                image: image // Only send if new image selected
            });

            // Notify other components to refresh
            window.dispatchEvent(new CustomEvent('postCreated')); // Reusing same event for refresh

            if (onPostCompleted) {
                onPostCompleted('Post updated successfully!', 'success');
            }

            setIsSubmitting(false);
            onClose();

        } catch (error) {
            if (onPostCompleted) {
                onPostCompleted('Failed to update post. Please try again.', 'error');
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 transition-opacity font-dm-sans">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold font-manrope text-gray-900">Edit Post</h2>
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
                    <form id="edit-post-form" onSubmit={handleSubmit} className="space-y-4">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full bg-white border-0 py-2 text-lg text-gray-900 placeholder-gray-400 focus:ring-0 focus:outline-none resize-none"
                            placeholder="What's on your mind?"
                            disabled={isSubmitting}
                            autoFocus
                        />

                        {imagePreview && (
                            <div className="relative mt-2 border border-gray-100 rounded-xl p-2 bg-gray-50 group">
                                <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    disabled={isSubmitting}
                                    className="absolute top-4 right-4 p-2 bg-gray-900/70 text-white rounded-full hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                    title="Remove image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
                    <label htmlFor="edit-image-upload" className="flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <input id="edit-image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} disabled={isSubmitting} />
                    </label>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-600 hover:bg-gray-100 font-bold rounded-full transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            form="edit-post-form"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;

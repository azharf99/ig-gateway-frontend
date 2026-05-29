import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePostStore from '../../store/usePostStore';
import useAuthStore from '../../store/useAuthStore';
import { 
  Image as ImageIcon, 
  Video, 
  Layers, 
  Film, 
  Upload, 
  X, 
  Calendar, 
  AlertCircle, 
  Loader, 
  Check, 
  Heart,
  MessageCircle,
  Send,
  Bookmark
} from 'lucide-react';
import Instagram from '../../components/icons/Instagram';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createPost, loading, error: storeError } = usePostStore();
  
  const [caption, setCaption] = useState('');
  const [postType, setPostType] = useState('photo'); // 'photo', 'video', 'carousel', 'reels'
  const [scheduleToggle, setScheduleToggle] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]); // { file, previewUrl, type }
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  // Clear previews on unmount
  useEffect(() => {
    return () => {
      mediaFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, [mediaFiles]);

  // Handle post type change -> reset media if type changes
  const handlePostTypeChange = (type) => {
    setPostType(type);
    setValidationError('');
    // Remove files that don't match or reset
    if (type !== 'carousel' && mediaFiles.length > 1) {
      // Keep only first file
      setMediaFiles(mediaFiles.slice(0, 1));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setValidationError('');
    const newMediaItems = [];

    for (let file of files) {
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      
      // Validation rules
      if (postType === 'reels' && type !== 'video') {
        setValidationError('Reels only support video files.');
        return;
      }
      if (postType === 'photo' && type !== 'image') {
        setValidationError('Photo post type only supports image files.');
        return;
      }
      if (postType === 'video' && type !== 'video') {
        setValidationError('Video post type only supports video files.');
        return;
      }

      newMediaItems.push({
        file,
        previewUrl: URL.createObjectURL(file),
        type
      });
    }

    if (postType === 'carousel') {
      const combined = [...mediaFiles, ...newMediaItems].slice(0, 10); // Limit to 10
      setMediaFiles(combined);
    } else {
      // For photo, video, reels, only allow 1 file
      setMediaFiles(newMediaItems.slice(0, 1));
    }
  };

  const handleRemoveMedia = (index) => {
    const fileToRemove = mediaFiles[index];
    URL.revokeObjectURL(fileToRemove.previewUrl);
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!user?.instagram_connected) {
      setValidationError('Please connect your Instagram account first.');
      return;
    }

    if (mediaFiles.length === 0) {
      setValidationError('Please upload at least one media file.');
      return;
    }

    if (postType === 'carousel' && mediaFiles.length < 2) {
      setValidationError('Carousel posts require at least 2 media files.');
      return;
    }

    if (scheduleToggle && !scheduledAt) {
      setValidationError('Please select a date and time for scheduling.');
      return;
    }

    if (scheduleToggle && new Date(scheduledAt) <= new Date()) {
      setValidationError('Scheduled time must be in the future.');
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('post_type', postType);
    
    if (scheduleToggle) {
      // Send as ISO String
      formData.append('scheduled_at', new Date(scheduledAt).toISOString());
    }

    mediaFiles.forEach((item) => {
      formData.append('media', item.file);
    });

    const success = await createPost(formData);
    if (success) {
      navigate('/');
    }
  };

  const postTypes = [
    { id: 'photo', label: 'Photo', icon: ImageIcon },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'carousel', label: 'Carousel', icon: Layers },
    { id: 'reels', label: 'Reels', icon: Film },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Left side: Upload Form */}
      <div className="lg:col-span-7 space-y-6">
        <div className="glass-card rounded-2xl border border-gray-800/60 p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Create New Post</h2>
            <p className="text-gray-400 text-sm">Fill in details and upload media to post on Instagram</p>
          </div>

          {(validationError || storeError) && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 leading-relaxed">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{validationError || storeError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Post Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Post Type</label>
              <div className="grid grid-cols-4 gap-2">
                {postTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = postType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handlePostTypeChange(type.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'border-instagram-pink bg-instagram-pink/10 text-white font-semibold' 
                          : 'border-gray-800 bg-gray-950/40 text-gray-400 hover:text-white hover:border-gray-700'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-[11px]">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media Uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Upload Media</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple={postType === 'carousel'}
                accept={
                  postType === 'photo' ? 'image/*' :
                  postType === 'video' || postType === 'reels' ? 'video/*' :
                  'image/*,video/*'
                }
                className="hidden"
              />

              {/* Upload Box */}
              {mediaFiles.length === 0 && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-800 hover:border-gray-700 bg-gray-950/20 hover:bg-gray-950/40 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center min-h-[160px]"
                >
                  <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-gray-400 group-hover:text-instagram-pink group-hover:bg-instagram-pink/5 transition duration-300 mb-3">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-semibold text-white">Click to upload files</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {postType === 'photo' && 'Upload an image (JPG, PNG)'}
                    {postType === 'video' && 'Upload a video (MP4)'}
                    {postType === 'carousel' && 'Upload up to 10 images or videos'}
                    {postType === 'reels' && 'Upload a 9:16 vertical video (MP4)'}
                  </p>
                </div>
              )}

              {/* Media Previews */}
              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {mediaFiles.map((item, index) => (
                    <div key={index} className="aspect-square bg-gray-900 rounded-xl overflow-hidden relative border border-gray-800 flex items-center justify-center">
                      {item.type === 'video' ? (
                        <video src={item.previewUrl} className="object-cover h-full w-full" muted />
                      ) : (
                        <img src={item.previewUrl} alt="Preview" className="object-cover h-full w-full" />
                      )}
                      
                      {/* Badge carousel number */}
                      {postType === 'carousel' && (
                        <span className="absolute top-2 left-2 bg-black/60 text-white font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition duration-200 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Add more item for Carousel */}
                  {postType === 'carousel' && mediaFiles.length < 10 && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-800 hover:border-gray-700 bg-gray-950/20 hover:bg-gray-950/40 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                    >
                      <Plus size={18} className="text-gray-500 mb-1" />
                      <span className="text-[10px] font-semibold text-gray-400">Add Media</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption... Add hashtags #ig #gateway"
                rows={4}
                className="w-full bg-gray-950/60 border border-gray-800/80 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-instagram-pink/60 focus:ring-1 focus:ring-instagram-pink/40 transition-all duration-300 text-sm leading-relaxed"
              />
            </div>

            {/* Scheduler Option */}
            <div className="p-4 rounded-xl bg-gray-950/30 border border-gray-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Schedule this post</h4>
                    <p className="text-[11px] text-gray-500">Pick a time to automatically post to Instagram</p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button
                  type="button"
                  onClick={() => setScheduleToggle(!scheduleToggle)}
                  className={`w-11 h-6 rounded-full transition duration-300 p-0.5 cursor-pointer flex items-center ${
                    scheduleToggle ? 'bg-instagram-pink justify-end' : 'bg-gray-800 justify-start'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow-md inline-block" />
                </button>
              </div>

              {scheduleToggle && (
                <div className="pt-2 animate-fadeIn">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-gray-950/80 border border-gray-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-instagram-pink/60 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-instagram-orange via-instagram-pink to-instagram-purple hover:brightness-110 active:scale-[0.98] transition-all duration-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-instagram-pink/15 cursor-pointer"
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                scheduleToggle ? 'Schedule Post' : 'Post Now'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side: Premium Live Mockup Preview */}
      <div className="lg:col-span-5 flex flex-col justify-start">
        <div className="sticky top-24">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center lg:text-left">Live Mobile Mockup Preview</label>
          
          {/* Mobile phone frame */}
          <div className="w-[280px] mx-auto bg-black rounded-[36px] p-2.5 shadow-2xl border-4 border-gray-800/80 relative overflow-hidden">
            {/* Notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-900 border border-gray-800/40 inline-block mr-1"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-950 inline-block"></span>
            </div>

            {/* Phone Screen Container */}
            <div className="w-full bg-[#000] rounded-[28px] overflow-hidden flex flex-col select-none relative z-10 text-white aspect-[9/16] text-[11px]">
              
              {/* Instagram Top Bar */}
              <div className="h-10 pt-4 px-3 flex items-center justify-between border-b border-gray-900">
                <span className="font-semibold text-white/90">Instagram</span>
                <div className="flex gap-2">
                  <Heart size={14} className="text-white/80" />
                  <MessageCircle size={14} className="text-white/80" />
                </div>
              </div>

              {/* User Bar */}
              <div className="p-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-instagram-yellow to-instagram-purple p-0.5 flex items-center justify-center">
                    <div className="h-full w-full rounded-full bg-black flex items-center justify-center font-bold text-[8px]">
                      {user?.username ? user.username[0].toUpperCase() : 'U'}
                    </div>
                  </div>
                  <span className="font-bold text-white/90">{user?.username || 'username'}</span>
                </div>
                <span className="font-bold text-white/60 tracking-wider">•••</span>
              </div>

              {/* Media Preview Box */}
              <div className="aspect-square bg-gray-950 flex items-center justify-center overflow-hidden relative">
                {mediaFiles.length > 0 ? (
                  mediaFiles[0].type === 'video' ? (
                    <video src={mediaFiles[0].previewUrl} className="object-cover h-full w-full" autoPlay loop muted />
                  ) : (
                    <img src={mediaFiles[0].previewUrl} alt="Preview" className="object-cover h-full w-full" />
                  )
                ) : (
                  <div className="flex flex-col items-center text-gray-600 gap-1.5">
                    <Instagram size={28} className="text-gray-800" />
                    <span className="text-[10px]">No Media Uploaded</span>
                  </div>
                )}

                {/* Carousel dots overlay */}
                {postType === 'carousel' && mediaFiles.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {mediaFiles.map((_, i) => (
                      <span 
                        key={i} 
                        className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-gray-500'}`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Feed Actions Bar */}
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex gap-2.5">
                  <Heart size={15} />
                  <MessageCircle size={15} />
                  <Send size={15} />
                </div>
                <Bookmark size={15} />
              </div>

              {/* Likes & Caption Panel */}
              <div className="px-2.5 space-y-1 overflow-y-auto max-h-[80px] scrollbar-none flex-1 pb-4">
                <p className="font-bold">1,245 likes</p>
                <p className="leading-relaxed leading-normal whitespace-pre-wrap">
                  <span className="font-bold mr-1.5">{user?.username || 'username'}</span>
                  {caption || <span className="text-gray-600 italic">Caption preview in real-time...</span>}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

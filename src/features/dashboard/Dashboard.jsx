import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import usePostStore from '../../store/usePostStore';
import { 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Layers,
  Image as ImageIcon,
  Play,
  RotateCw
} from 'lucide-react';
import Instagram from '../../components/icons/Instagram';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, getInstagramOAuthURL } = useAuthStore();
  const { posts, loading, fetchPosts, deletePost } = usePostStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleConnectInstagram = async () => {
    const url = await getInstagramOAuthURL();
    if (url) {
      window.location.href = url;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-full font-medium">
            <CheckCircle size={12} />
            Published
          </span>
        );
      case 'scheduled':
        return (
          <span className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium">
            <Clock size={12} />
            Scheduled
          </span>
        );
      case 'posting':
        return (
          <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-medium animate-pulse">
            <RotateCw size={12} className="animate-spin" />
            Posting
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-2.5 py-1 rounded-full font-medium">
            <AlertCircle size={12} />
            Failed
          </span>
        );
      default:
        return (
          <span className="bg-gray-800 text-gray-400 text-xs px-2.5 py-1 rounded-full font-medium">
            {status}
          </span>
        );
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'photo':
        return <ImageIcon size={14} className="text-gray-400" />;
      case 'video':
      case 'reels':
        return <Play size={14} className="text-gray-400" />;
      case 'carousel':
        return <Layers size={14} className="text-gray-400" />;
      default:
        return null;
    }
  };

  // Stats calculation
  const totalPosts = posts.length;
  const publishedCount = posts.filter(p => p.Status === 'published').length;
  const scheduledCount = posts.filter(p => p.Status === 'scheduled').length;
  const failedCount = posts.filter(p => p.Status === 'failed').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* IG Connection Prompt Banner */}
      {!user?.instagram_connected && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-instagram-pink/20 to-instagram-purple/10 border border-instagram-pink/30 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-instagram-pink/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-instagram-orange via-instagram-pink to-instagram-purple flex items-center justify-center text-white shadow-md">
              <Instagram size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Instagram Account Required</h3>
              <p className="text-gray-300 text-sm mt-0.5">Please link your Instagram Creator/Business account to start posting and scheduling.</p>
            </div>
          </div>
          <button
            onClick={handleConnectInstagram}
            className="w-full md:w-auto px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition duration-300 text-sm shadow-md cursor-pointer"
          >
            Connect Account
          </button>
        </div>
      )}

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Posts', value: totalPosts, color: 'text-gray-300' },
          { label: 'Published', value: publishedCount, color: 'text-green-400' },
          { label: 'Scheduled', value: scheduledCount, color: 'text-blue-400' },
          { label: 'Failed', value: failedCount, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-gray-800/60 flex flex-col">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
            <span className={`text-2xl font-black mt-2 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Post Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">Post History</h2>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-instagram-orange to-instagram-pink text-white font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-sm shadow-lg shadow-instagram-pink/15 cursor-pointer"
          >
            <Plus size={16} />
            New Post
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-instagram-pink" />
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card rounded-2xl border border-gray-800/60 p-12 text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-white text-base">No posts found</h3>
            <p className="text-gray-500 text-sm max-w-xs mt-1">Start uploading and scheduling your Instagram content by creating a new post.</p>
            <button
              onClick={() => navigate('/create')}
              className="mt-6 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition duration-300 text-sm cursor-pointer border border-gray-700/60"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.ID} className="glass-card rounded-2xl border border-gray-800/60 overflow-hidden flex flex-col shadow-lg group hover:border-gray-700/80 transition-all duration-300">
                {/* Media Container */}
                <div className="aspect-square w-full bg-gray-950 relative overflow-hidden flex items-center justify-center border-b border-gray-950">
                  {post.Media && post.Media.length > 0 ? (
                    post.Media[0].MediaType === 'video' ? (
                      post.Media[0].ThumbnailURL ? (
                        <div className="relative h-full w-full">
                          <img 
                            src={post.Media[0].ThumbnailURL} 
                            alt="Media Preview" 
                            className="object-cover h-full w-full"
                            loading="lazy"
                          />
                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-300">
                            <div className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white shadow-md transform group-hover:scale-105 transition-all duration-300">
                              <Play size={18} fill="currentColor" className="translate-x-[1px]" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <video 
                          src={post.Media[0].MediaURL} 
                          className="object-cover h-full w-full"
                          controls={false}
                          muted
                        />
                      )
                    ) : (
                      <img 
                        src={post.Media[0].MediaURL} 
                        alt="Media Preview" 
                        className="object-cover h-full w-full"
                        loading="lazy"
                      />
                    )
                  ) : (
                    <div className="text-gray-600 text-xs">No media preview</div>
                  )}

                  {/* Top Badges overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 border border-white/5 capitalize">
                      {getPostTypeIcon(post.PostType)}
                      {post.PostType}
                    </span>
                    
                    {getStatusBadge(post.Status)}
                  </div>
                </div>

                {/* Content Panel */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {post.Caption || <span className="text-gray-600 italic">No caption provided</span>}
                    </p>

                    {/* Metadata indicators */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-900/80">
                      {post.Status === 'scheduled' && post.ScheduledAt && (
                        <div className="flex items-center gap-2 text-xs text-blue-400/90 font-medium">
                          <Clock size={12} />
                          <span>Post at {new Date(post.ScheduledAt).toLocaleString()}</span>
                        </div>
                      )}
                      {post.Status === 'published' && post.PublishedAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <CheckCircle size={12} />
                          <span>Published at {new Date(post.PublishedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {post.Status === 'failed' && post.ErrorMessage && (
                        <div className="flex items-start gap-1.5 text-xs text-red-400 bg-red-950/10 border border-red-950/20 rounded-lg p-2 leading-normal">
                          <AlertCircle size={12} className="shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{post.ErrorMessage}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-900/60">
                    <span className="text-[10px] text-gray-500">Created: {new Date(post.CreatedAt).toLocaleDateString()}</span>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this post?')) {
                          deletePost(post.ID);
                        }
                      }}
                      className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/20 border border-transparent hover:border-red-950/30 transition-all duration-300 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

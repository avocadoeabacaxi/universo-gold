import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import PostCard from '@/components/feed/PostCard';
import CreatePostCard from '@/components/feed/CreatePostCard';
import ComunicadosSection from '@/components/feed/ComunicadosSection';
import StoriesBar from '@/components/stories/StoriesBar';
import LeftSidebar from '@/components/sidebar/LeftSidebar';
import RightSidebar from '@/components/sidebar/RightSidebar';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      setCurrentUser(user);
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.id });
      setUserProfile(profiles[0] || null);
      const p = await base44.entities.Post.filter({ status: 'active' }, '-created_date', 20);
      setPosts(p);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const enrichedUser = currentUser ? {
    ...currentUser,
    job_title: userProfile?.job_title,
    department: userProfile?.department,
    avatar_url: userProfile?.avatar_url || currentUser?.avatar_url,
  } : null;

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDelete = async (postId) => {
    await base44.entities.Post.update(postId, { status: 'deleted' });
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4">
      <div className="flex gap-4">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar currentUser={enrichedUser} />
        </div>

        {/* Feed */}
        <div className="flex-1 min-w-0 space-y-3 max-w-2xl mx-auto lg:mx-0">
          <StoriesBar currentUser={enrichedUser} />
          <ComunicadosSection currentUser={enrichedUser} />
          <CreatePostCard
            currentUser={enrichedUser}
            onPostCreated={handlePostCreated}
          />
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">Nenhuma publicação ainda</p>
              <p className="text-sm mt-1">Seja o primeiro a publicar algo!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={enrichedUser}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block">
          <RightSidebar currentUser={enrichedUser} />
        </div>
      </div>
    </div>
  );
}
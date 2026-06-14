import { ScreenHeader } from "@/components/ui";
import { ProfileView } from "@/components/ProfileView";
import { requireUserId } from "@/lib/auth";
import { getProfile } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const userId = await requireUserId();
  const [profile, supabase] = await Promise.all([getProfile(userId), createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <ScreenHeader subtitle="Account" title="Profile" />
      <ProfileView
        fullName={profile?.fullName ?? ""}
        nickname={profile?.nickname ?? ""}
        avatarEmoji={profile?.avatarEmoji ?? "🙂"}
        email={user?.email ?? ""}
      />
    </>
  );
}

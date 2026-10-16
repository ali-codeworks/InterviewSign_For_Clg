import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { AppContext } from "./context";
import { AnswerPreference, UserData } from "./type";

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string | null;
  city: string | null;
  hearing_status: string | null;
  answer_preference: AnswerPreference;
  avatar_url: string | null;
  username_changed_at: string | null;
};

const mapProfile = (row: ProfileRow): UserData => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  username: row.username,
  email: row.email,
  phone: row.phone ?? "",
  city: row.city ?? "",
  hearingStatus: row.hearing_status ?? "",
  answerPreference: row.answer_preference,
  avatarUrl: row.avatar_url ?? "",
  usernameChangedAt: row.username_changed_at,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      setUserData(null);
      return;
    }
    setUserData(mapProfile(data as ProfileRow));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (!newSession) {
          setUserData(null);
          setLoading(false);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId).finally(() => setLoading(false));
  }, [userId, fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await fetchProfile(data.session.user.id);
    }
  }, [fetchProfile]);

  const value = useMemo(
    () => ({
      userData,
      isAuthorized: userData !== null,
      loading,
      logout,
      refreshProfile,
    }),
    [userData, loading, logout, refreshProfile],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

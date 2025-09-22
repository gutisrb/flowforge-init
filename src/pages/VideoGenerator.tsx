import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { VideoWizard } from "@/components/VideoWizard";
import { useProgress } from "@/contexts/ProgressContext";

interface IndexProps {
  user: User;
  session: Session;
}

const Index = ({ user, session }: IndexProps) => {
  return <VideoWizard user={user} session={session} />;
};

export default Index;

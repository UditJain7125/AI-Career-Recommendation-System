import { useEffect, useState } from "react";
import axios from "axios";

interface ProfileData {
  name: string;
  profile_image?: string | null;
}

function Topbar() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data);
      } catch (error) {
        console.error("Topbar profile error:", error);
      }
    };

    fetchProfile();
  }, []);

  const imageUrl = profile?.profile_image
    ? `http://127.0.0.1:8000/${profile.profile_image}`
    : null;

  return (
    <header className="topbar">
      <div>
        <h2>AI Career Recommendation</h2>
        <p>Find the career that matches you.</p>
      </div>

      <div className="topbar-profile">
        <div className="notification">
          🔔
        </div>

        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="profile-avatar profile-avatar-image"
          />
        ) : (
          <div className="profile-avatar">
            👤
          </div>
        )}
      </div>
    </header>
  );
}

export default Topbar;

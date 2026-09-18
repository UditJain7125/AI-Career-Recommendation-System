import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { API_BASE_URL } from "../pages/config";

interface ProfileData {
  id: number;
  name: string;
  email: string;
  education?: string | null;
  course?: string | null;
  graduation_year?: number | null;
  profile_image?: string | null;
}

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data);
      } catch (err) {
        console.error("Profile error:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }

          setError(
            err.response?.data?.detail ||
              "Unable to load profile."
          );
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError("");
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();

    formData.append("photo", selectedFile);

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/profile/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Profile photo uploaded successfully."
      );

      setProfile((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          profile_image: response.data.profile_image,
        };
      });

      setSelectedFile(null);
    } catch (err) {
      console.error("Photo upload error:", err);

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.detail ||
            "Unable to upload profile photo."
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="dashboard-content">
            <div className="profile-loading">
              Loading profile...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard-layout">
        <Sidebar />

        <div className="dashboard-main">
          <Topbar />

          <main className="dashboard-content">
            <div className="error-message">
              {error || "Profile could not be loaded."}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const imageUrl = profile.profile_image
    ? `${API_BASE_URL}/${profile.profile_image}`
    : null;

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <div className="dashboard-main">

        <Topbar />

        <main className="dashboard-content">

          <div className="profile-page">

            {/* PAGE HEADER */}
            <div className="profile-page-header">

              <div>
                <p className="welcome-label">
                  ACCOUNT
                </p>

                <h1>
                  My Profile
                </h1>

                <p>
                  Manage your personal information
                  and profile photo.
                </p>
              </div>

            </div>


            {/* PROFILE CARD */}
            <div className="profile-main-card">


              {/* LEFT SIDE */}
              <div className="profile-photo-section">

                <div className="profile-photo-wrapper">

                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Profile"
                      className="profile-photo"
                    />
                  ) : (
                    <div className="profile-photo-placeholder">
                      👤
                    </div>
                  )}

                </div>


                <h2>
                  {profile.name || "User"}
                </h2>

                <p className="profile-email">
                  {profile.email}
                </p>


                {/* UPLOAD */}
                <div className="profile-upload">

                  <label
                    htmlFor="profile-photo-input"
                    className="profile-upload-button"
                  >
                    📷 Choose Photo
                  </label>

                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />


                  {selectedFile && (
                    <>
                      <p className="selected-file">
                        {selectedFile.name}
                      </p>

                      <button
                        type="button"
                        className="dashboard-primary-button"
                        onClick={handleUpload}
                        disabled={uploading}
                      >
                        {uploading
                          ? "Uploading..."
                          : "Upload Photo"}
                      </button>
                    </>
                  )}

                </div>


                <small className="profile-photo-note">
                  Profile photo is optional.
                  <br />
                  Maximum file size: 5 MB.
                </small>

              </div>


              {/* RIGHT SIDE */}
              <div className="profile-information">

                <h2>
                  Personal Information
                </h2>

                <p className="profile-information-subtitle">
                  Your account information
                </p>


                <div className="profile-info-grid">


                  <div className="profile-info-item">

                    <span>
                      Full Name
                    </span>

                    <strong>
                      {profile.name || "--"}
                    </strong>

                  </div>


                  <div className="profile-info-item">

                    <span>
                      Email
                    </span>

                    <strong>
                      {profile.email || "--"}
                    </strong>

                  </div>


                  <div className="profile-info-item">

                    <span>
                      Education
                    </span>

                    <strong>
                      {profile.education || "--"}
                    </strong>

                  </div>


                  <div className="profile-info-item">

                    <span>
                      Course / Branch
                    </span>

                    <strong>
                      {profile.course || "--"}
                    </strong>

                  </div>


                  <div className="profile-info-item">

                    <span>
                      Graduation Year
                    </span>

                    <strong>
                      {profile.graduation_year || "--"}
                    </strong>

                  </div>


                </div>

              </div>

            </div>


            {/* SUCCESS MESSAGE */}
            {message && (
              <div className="success-message">
                ✓ {message}
              </div>
            )}


            {/* ERROR MESSAGE */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Profile;
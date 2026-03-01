import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { buildApiUrl } from "../../config/api";
import "./style.css";

const mapUserToForm = (user) => {
  const fullName = (user?.name || "").trim();
  const [firstName = "", ...restNames] = fullName.split(" ");
  const lastName = restNames.join(" ");
  const primaryAddress = user?.address_details?.[0] || {};

  return {
    firstName,
    lastName,
    email: user?.email || "",
    phone: user?.mobile || "",
    address: primaryAddress.address_line || "",
    location: primaryAddress.city || "",
    postalCode: primaryAddress.pincode || "",
    state: primaryAddress.state || "",
    country: primaryAddress.country || "",
    gender: "male",
    dateOfBirth: "",
    addressId: primaryAddress.id,
  };
};

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, logout, updateProfile } = useAuth();

  const [form, setForm] = useState(() => mapUserToForm(userInfo));
  const [initialForm, setInitialForm] = useState(() => mapUserToForm(userInfo));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
      return;
    }

    const nextForm = mapUserToForm(userInfo);
    setForm(nextForm);
    setInitialForm(nextForm);
  }, [userInfo, navigate]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDiscard = () => {
    setForm(initialForm);
    setError("");
    setMessage("");
  };

  const handleLogout = async () => {
    try {
      await axios.get(buildApiUrl("/api/user/logout"), { withCredentials: true });
    } catch (logoutError) {
      console.error(logoutError);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.firstName.trim()) {
      setError("First name is required");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        mobile: form.phone.trim(),
        address_details: [
          {
            ...(form.addressId ? { id: form.addressId } : {}),
            address_line: form.address || "",
            city: form.location || "",
            state: form.state || "",
            pincode: form.postalCode || "",
            country: form.country || "",
            mobile: form.phone || "",
          },
        ],
      };

      const response = await axios.put(buildApiUrl("/api/user/profile/update"), payload, {
        withCredentials: true,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to update profile");
      }

      updateProfile(response.data.data);
      const nextForm = mapUserToForm(response.data.data);
      setForm(nextForm);
      setInitialForm(nextForm);
      setMessage("Profile updated successfully");
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!userInfo) return <div className="profile-loading">Loading...</div>;

  const avatarUrl =
    userInfo.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || "User")}&background=ececec&color=222`;

  return (
    <section className="profile-page">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-avatar-wrap">
            <img src={avatarUrl} alt="Profile" className="profile-avatar" />
          </div>
          <h3 className="profile-user-name">{userInfo.name || "User"}</h3>
          <p className="profile-user-role">{userInfo.role || "Customer"}</p>

          <div className="profile-menu">
            <button type="button" className="profile-menu-item active">Personal Information</button>
            <button type="button" className="profile-menu-item" onClick={() => navigate("/profile/edit")}>Login & Password</button>
            <button type="button" className="profile-menu-item" onClick={handleLogout}>Log Out</button>
          </div>
        </aside>

        <form className="profile-main" onSubmit={handleSave}>
          <h2 className="profile-heading">Personal Information</h2>

          {error && <p className="profile-error">{error}</p>}
          {message && <p className="profile-success">{message}</p>}

          <div className="profile-gender-row">
            <label className="radio-item">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "male"}
                onChange={() => handleChange("gender", "male")}
              />
              <span>Male</span>
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="gender"
                checked={form.gender === "female"}
                onChange={() => handleChange("gender", "female")}
              />
              <span>Female</span>
            </label>
          </div>

          <div className="profile-grid two-col">
            <div className="field-wrap">
              <label>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(event) => handleChange("firstName", event.target.value)}
              />
            </div>
            <div className="field-wrap">
              <label>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => handleChange("lastName", event.target.value)}
              />
            </div>
          </div>

          <div className="field-wrap">
            <label>Email</label>
            <div className="verified-input">
              <input type="email" value={form.email} readOnly />
              <span>Verified</span>
            </div>
          </div>

          <div className="field-wrap">
            <label>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(event) => handleChange("address", event.target.value)}
            />
          </div>

          <div className="profile-grid two-col">
            <div className="field-wrap">
              <label>Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(event) => handleChange("phone", event.target.value)}
              />
            </div>
            <div className="field-wrap">
              <label>Date of Birth</label>
              <input
                type="text"
                placeholder="dd mmm, yyyy"
                value={form.dateOfBirth}
                onChange={(event) => handleChange("dateOfBirth", event.target.value)}
              />
            </div>
          </div>

          <div className="profile-grid two-col">
            <div className="field-wrap">
              <label>Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(event) => handleChange("location", event.target.value)}
              />
            </div>
            <div className="field-wrap">
              <label>Postal Code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(event) => handleChange("postalCode", event.target.value)}
              />
            </div>
          </div>

          <div className="profile-actions">
            <button type="button" className="btn-outline" onClick={handleDiscard} disabled={!isDirty || saving}>
              Discard Changes
            </button>
            <button type="submit" className="btn-fill" disabled={saving || !isDirty}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Profile;
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setUser } from "../features/auth/authSlice";
import { userApi } from "../features/users/userApi";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import {
  HiUser,
  HiEnvelope,
  HiLockClosed,
  HiCheck,
  HiMapPin,
} from "react-icons/hi2";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { addressApi } from "../features/users/addressApi";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    addressApi
      .getAll()
      .then(({ data }) => {
        setAddresses(data.data.addresses || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userApi.updateProfile({ name, email });
      dispatch(setUser(data.data.user));
      toast.success("Profile updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New Password can't be the same as current password");
    }

    setSaving(true);
    try {
      await userApi.updatePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated!");
    } catch (error) {
      setPasswordError(
        error.response?.data?.message || "Failed to update password",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto px-4 py-6'>
      <h1 className='text-2xl font-bold text-[#0F1111] mb-6'>My Account</h1>

      {/* Tabs */}
      <div className='flex gap-6 border-b border-[#D5D9D9] mb-6'>
        {[
          { key: "profile", label: "Profile", icon: HiUser },
          { key: "password", label: "Password", icon: HiLockClosed },
          { key: "addresses", label: "Addresses", icon: HiMapPin },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#FF9900] text-[#FF9900]"
                : "border-transparent text-[#565959] hover:text-[#0F1111]"
            }`}
          >
            <tab.icon className='w-4 h-4' />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleUpdateProfile}
          className='bg-white rounded-lg p-6 shadow-sm space-y-4'
        >
          <div>
            <label className='block text-sm font-medium text-[#0F1111] mb-1'>
              Full Name
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-[#0F1111] mb-1'>
              Email
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            />
          </div>

          {/* Email verification status */}
          {user && !user.isEmailVerified && (
            <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800'>
              Your email is not verified. Check your inbox or{" "}
              <button
                type='button'
                className='text-[#FF9900] hover:underline font-medium'
              >
                resend verification
              </button>
            </div>
          )}
          {user?.isEmailVerified && (
            <div className='flex items-center gap-2 text-sm text-[#067D62]'>
              <HiCheck className='w-4 h-4' /> Email verified
            </div>
          )}

          <Button type='submit' variant='primary' disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      )}

      {/* Password Form */}
      {activeTab === "password" && (
        <form
          onSubmit={handleUpdatePassword}
          className='bg-white rounded-lg p-6 shadow-sm space-y-4'
        >
          {passwordError && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#B12704]'>
              {passwordError}
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-[#0F1111] mb-1'>
              Current Password
            </label>
            <input
              type='password'
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-[#0F1111] mb-1'>
              New Password
            </label>
            <input
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            />
            <p className='text-xs text-[#565959] mt-1'>At least 6 characters</p>
          </div>

          <div>
            <label className='block text-sm font-medium text-[#0F1111] mb-1'>
              Confirm New Password
            </label>
            <input
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className='w-full px-4 py-2.5 text-sm border border-[#D5D9D9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9900]'
            />
          </div>

          <Button type='submit' variant='primary' disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}

      {/* Addressed Section */}
      {activeTab === "addresses" && (
        <div className='bg-white rounded-lg p-6 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold text-[#0F1111]'>
              My Addresses
            </h2>
            <Link to='/profile/addresses'>
              <Button variant='outline' size='sm'>
                Manage Addresses
              </Button>
            </Link>
          </div>
          {/* Show first 2 addresses as preview */}
          {addresses.length === 0 ? (
            <p className='text-sm text-[#565959]'>No addresses added yet.</p>
          ) : (
            <div className='space-y-3'>
              {addresses.slice(0, 2).map((addr) => (
                <div key={addr._id} className='p-3 bg-[#F7FAFA] rounded-lg'>
                  <p className='text-sm font-medium'>{addr.label}</p>
                  <p className='text-xs text-[#565959]'>
                    {addr.street}, {addr.city}
                  </p>
                </div>
              ))}
              {addresses.length > 2 && (
                <p className='text-xs text-[#565959]'>
                  +{addresses.length - 2} more
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

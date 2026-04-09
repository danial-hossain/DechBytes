import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:5001/api/user/profile", {
          withCredentials: true,
        });

        const saved = JSON.parse(localStorage.getItem("userInfo") || "{}");
        setUserInfo({ ...data, accessToken: saved.accessToken });
      } catch (err) {
        setUserInfo(null);
        localStorage.removeItem("userInfo");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const login = (userData) => {
    setUserInfo(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem("userInfo");
  };

  const updateProfile = (updatedData) => {
    const updated = { ...updatedData, accessToken: userInfo?.accessToken };
    setUserInfo(updated);
    localStorage.setItem("userInfo", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ userInfo, login, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default useAuth;
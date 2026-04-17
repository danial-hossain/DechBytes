// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import ReportPage from "./Pages/Report";
import Home from "./Pages/Home";
import Cart from "./Pages/Cart";
import Order from "./Pages/Order";
import Login from "./Pages/Login";
import SignUp from "./Pages/SignUp";
import Profile from "./Pages/Profile";
import ProfileInformation from "./Pages/Profile/Information";
import Dashboard from "./Pages/DASHBOARD";
import HelpCenter from "./Pages/Help";
import MessagingPage from "./Pages/Messaging";
import Verification from "./Pages/Verification";
import SearchPage from "./Pages/SearchPage";
import OrderTracking from "./Pages/OrderTracking";

// Order Status Pages
import OrderSuccess from "./Pages/Order/Success";
import OrderFail from "./Pages/Order/Fail";
import OrderCancel from "./Pages/Order/Cancel";
import OrderError from "./Pages/Order/Error";

// Profile Orders Page
import ProfileOrders from "./Pages/Profile/Orders";

// Product Pages (category lists)
import ProductListing from "./Pages/ProductListing";

// Product Detail Pages
import Arm from "./Pages/ProductDetail/arm";
import Legs from "./Pages/ProductDetail/leg";
import Electronics from "./Pages/ProductDetail/electronics";
import Desktop from "./Pages/ProductDetail/desktop";
import Laptop from "./Pages/ProductDetail/laptop";

const LayoutWithHeaderFooter = ({ children }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          <Route
            path="/"
            element={
              <LayoutWithHeaderFooter>
                <Home />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/login"
            element={
              <LayoutWithHeaderFooter>
                <Login />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/signup"
            element={
              <LayoutWithHeaderFooter>
                <SignUp />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/verify"
            element={
              <LayoutWithHeaderFooter>
                <Verification />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/search"
            element={
              <LayoutWithHeaderFooter>
                <SearchPage />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/help"
            element={
              <LayoutWithHeaderFooter>
                <HelpCenter />
              </LayoutWithHeaderFooter>
            }
          />

          {/* ===== ORDER STATUS PAGES (PUBLIC) ===== */}
          <Route
            path="/order/success"
            element={
              <LayoutWithHeaderFooter>
                <OrderSuccess />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/order/fail"
            element={
              <LayoutWithHeaderFooter>
                <OrderFail />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/order/cancel"
            element={
              <LayoutWithHeaderFooter>
                <OrderCancel />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/order/error"
            element={
              <LayoutWithHeaderFooter>
                <OrderError />
              </LayoutWithHeaderFooter>
            }
          />

          {/* ===== PRODUCT CATEGORY PAGES ===== */}
          <Route
            path="/desktops"
            element={
              <LayoutWithHeaderFooter>
                <ProductListing />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/laptops"
            element={
              <LayoutWithHeaderFooter>
                <ProductListing />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/arms"
            element={
              <LayoutWithHeaderFooter>
                <ProductListing />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/legs"
            element={
              <LayoutWithHeaderFooter>
                <ProductListing />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/electronics"
            element={
              <LayoutWithHeaderFooter>
                <ProductListing />
              </LayoutWithHeaderFooter>
            }
          />

          {/* ===== PRODUCT DETAIL PAGES ===== */}
          <Route
            path="/product/arms/:id"
            element={
              <LayoutWithHeaderFooter>
                <Arm />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/product/legs/:id"
            element={
              <LayoutWithHeaderFooter>
                <Legs />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/product/electronics/:id"
            element={
              <LayoutWithHeaderFooter>
                <Electronics />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/product/desktops/:id"
            element={
              <LayoutWithHeaderFooter>
                <Desktop />
              </LayoutWithHeaderFooter>
            }
          />
          <Route
            path="/product/laptops/:id"
            element={
              <LayoutWithHeaderFooter>
                <Laptop />
              </LayoutWithHeaderFooter>
            }
          />

          {/* ===== PROTECTED USER ROUTES ===== */}
          <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
            <Route
              path="/profile"
              element={
                <LayoutWithHeaderFooter>
                  <Profile />
                </LayoutWithHeaderFooter>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <LayoutWithHeaderFooter>
                  <ProfileInformation />
                </LayoutWithHeaderFooter>
              }
            />
            <Route
              path="/profile/orders"
              element={
                <LayoutWithHeaderFooter>
                  <ProfileOrders />
                </LayoutWithHeaderFooter>
              }
            />
            <Route
              path="/cart"
              element={
                <LayoutWithHeaderFooter>
                  <Cart />
                </LayoutWithHeaderFooter>
              }
            />
            <Route
              path="/order"
              element={
                <LayoutWithHeaderFooter>
                  <Order />
                </LayoutWithHeaderFooter>
              }
            />
            <Route
              path="/order-tracking"
              element={
                <LayoutWithHeaderFooter>
                  <OrderTracking />
                </LayoutWithHeaderFooter>
              }
            />

            {/* ===== REPORT PAGE (USER PROTECTED) ===== */}
            <Route
              path="/report"
              element={
                <LayoutWithHeaderFooter>
                  <ReportPage />
                </LayoutWithHeaderFooter>
              }
            />

            {/* ===== MESSAGING PAGE (USER PROTECTED) ===== */}
            <Route
              path="/messaging"
              element={
                <LayoutWithHeaderFooter>
                  <MessagingPage />
                </LayoutWithHeaderFooter>
              }
            />
          </Route>

          {/* ===== ADMIN ROUTES ===== */}
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/message" element={<Dashboard initialTab="messages" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
// src/components/AdsBannerSlider.js
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';
import BannerBox from '../BannerBox';
import './style.css';

const AdsBannerSlider = ({ items }) => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        // ✅ শুধু এই লাইনটা পরিবর্তন করুন (পূর্বে ছিল /api/home/advertisements)
        const res = await fetch("http://localhost:5001/api/advertisements", {
          credentials: "include"
        });
        const data = await res.json();

        console.log("Ads API response:", data); // ডিবাগ করার জন্য

        // Fix: check if data is array
        if (Array.isArray(data)) {
          setAds(data);
        } else if (data && Array.isArray(data.ads)) {
          setAds(data.ads);
        } else {
          console.warn("Unexpected API response:", data);
          setAds([]);
        }
      } catch (err) {
        console.error("Failed to fetch advertisements:", err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) return <div className="ads-banner-slider">Loading ads...</div>;
  if (ads.length === 0) return null;

  return (
    <div className="ads-banner-slider">
      <Swiper
        slidesPerView={items || 4}
        spaceBetween={10}
        navigation={true}
        loop={ads.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Navigation, Autoplay]}
        className="ads-swiper"
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: items || 4 },
        }}
      >
        {ads.map((ad) => (
          <SwiperSlide key={ad.id || ad._id}>
            <BannerBox img={ad.photo_url || ad.imageUrl} link="/" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AdsBannerSlider;
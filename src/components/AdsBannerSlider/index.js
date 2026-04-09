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
        const res = await fetch("http://localhost:5001/api/home/advertisements");
        const data = await res.json();

        // Fix: check if data.ads exists and is an array
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

  if (loading) return <div className="ads-banner-slider">Loading...</div>;
  if (ads.length === 0) return null;

  return (
    <div className="ads-banner-slider">
      <Swiper
        slidesPerView={items}
        spaceBetween={10}
        navigation={true}
        loop={ads.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Navigation, Autoplay]}
        className="ads-swiper"
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
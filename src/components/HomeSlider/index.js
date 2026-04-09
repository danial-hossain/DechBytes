import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';

const HomeSlider = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/home/banners");
        const data = await res.json();

        // Handle both cases: array directly or object with banners array
        if (Array.isArray(data)) {
          setBanners(data);
        } else if (data && Array.isArray(data.banners)) {
          setBanners(data.banners);
        } else {
          console.warn("Unexpected API response:", data);
          setBanners([]);
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading) return <div className="featured-section">Loading...</div>;
  if (banners.length === 0) return null;

  return (
    <div className="featured-section">
      <div className="product-slider-container">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          spaceBetween={20}
          slidesPerView={1}
          loop={banners.length > 1}
          className="product-swiper"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id || banner._id}>
              <div className="product-slide">
                <img
                  src={banner.photo_url || banner.imageUrl}
                  alt={banner.title || `Banner ${banner.id || banner._id}`}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HomeSlider;
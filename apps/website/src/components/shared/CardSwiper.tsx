import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar, Navigation, Keyboard } from "swiper/modules";
import React from "react";

export const CardSwiper: React.FC<{
  cards: React.ReactNode[];
  className?: string;
  slideClasses?: string;
}> = ({ cards, className = "", slideClasses = "" }) => {
  return (
    <Swiper
      className={`${className} mx-0`}
      scrollbar={{
        hide: true,
      }}
      grabCursor={true}
      navigation={true}
      keyboard={true}
      modules={[Keyboard, Navigation, Scrollbar]}
      spaceBetween={10}
      slidesPerView="auto"
      centerInsufficientSlides={false}
      centeredSlides={false}
    >
      {cards.map((card, index) => {
        return (
          <SwiperSlide className={slideClasses} key={index}>
            {card}
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

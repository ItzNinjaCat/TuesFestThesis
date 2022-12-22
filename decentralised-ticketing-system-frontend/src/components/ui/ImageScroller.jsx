import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';
import '../../style/imagescroller.scss';

const ImageScroller = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageRef = useRef();

  const handlePreviousClick = () => {
    setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
    imageRef.current.style.transition = 'none';
    imageRef.current.style.transform = 'translateX(-100%)';
    setTimeout(() => {
      imageRef.current.style.transition = 'transform 0.5s';
      imageRef.current.style.transform = 'translateX(0)';
    }, 20);
  };

  const handleNextClick = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
    imageRef.current.style.transition = 'none';
    imageRef.current.style.transform = 'translateX(100%)';
    setTimeout(() => {
      imageRef.current.style.transition = 'transform 0.5s';
      imageRef.current.style.transform = 'translateX(0)';
    }, 20);
  };

  return (
    <div className="d-flex justify-content-between">
      <Button variant="secondary" onClick={handlePreviousClick}>
        Previous
      </Button>
      <img
        src={images[currentImageIndex]}
        alt="Current image"
        className="img-fluid image-scroller__image"
        ref={imageRef}
      />
      <Button variant="secondary" onClick={handleNextClick}>
        Next
      </Button>
    </div>
  );
};

export default ImageScroller;

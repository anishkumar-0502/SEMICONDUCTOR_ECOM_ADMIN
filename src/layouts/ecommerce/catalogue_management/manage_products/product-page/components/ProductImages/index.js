import PropTypes from "prop-types";
import SoftBox from "components/SoftBox";
import { useState, useEffect } from "react";
import ImgsViewer from "react-images-viewer";

function ProductImages({ imageUrl, name }) {
  const [imgsViewer, setImgsViewer] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageUrl || "");
  const [imgsViewerCurrent, setImgsViewerCurrent] = useState(0);

  useEffect(() => {
    if (imageUrl) setCurrentImage(imageUrl);
  }, [imageUrl]);

  const openImgsViewer = () => setImgsViewer(true);
  const closeImgsViewer = () => setImgsViewer(false);

  return (
    <SoftBox>
      <ImgsViewer
        imgs={[{ src: currentImage }]}
        isOpen={imgsViewer}
        onClose={closeImgsViewer}
        currImg={imgsViewerCurrent}
        backdropCloseable
      />

      <SoftBox
        component="img"
        src={currentImage}
        alt={name || "Product Image"}
        shadow="lg"
        borderRadius="lg"
        width="100%"
        sx={{ cursor: "pointer" }}
        onClick={openImgsViewer}
      />
    </SoftBox>
  );
}

ProductImages.propTypes = {
  imageUrl: PropTypes.string,
  name: PropTypes.string,
};

export default ProductImages;

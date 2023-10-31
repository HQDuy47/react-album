import React, { useState, useEffect, useRef, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroller"; // Import thư viện
import "./App.css";
import axios from "axios";

const App = () => {
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const inputRef = useRef(input);

  const getImages = useCallback(
    async (url, nextPage) => {
      try {
        const response = await axios.get(url);
        const data = response.data;
        if (nextPage) {
          setImages((prevImages) => [...prevImages, ...data.results]);
          setPage((prevPage) => prevPage + 1);
        } else {
          setImages(data.results);
          setPage(1);
        }
      } catch (error) {
        console.error("Lỗi: ", error);
        setHasMore(false);
      }
    },
    [setImages, setPage, setHasMore]
  );

  const handleSearch = () => {
    const searchUrl = `https://api.unsplash.com/search/photos?page=3&query=${input}&client_id=${process.env.REACT_APP_ACCESS_KEY}&per_page=30`;
    setImages([]);
    getImages(searchUrl, false);
    setInput("");
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const defaultUrl = `https://api.unsplash.com/search/photos?page=1&query=random&client_id=${process.env.REACT_APP_ACCESS_KEY}&per_page=30`;
    getImages(defaultUrl, false);
  }, [getImages]);

  useEffect(() => {
    const handleScroll = () => {
      if (hasMore) {
        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 50
        ) {
          const query = inputRef.current || "random";
          const url = `https://api.unsplash.com/search/photos?page=${
            page + 1
          }&query=${query}&client_id=${
            process.env.REACT_APP_ACCESS_KEY
          }&per_page=30`;
          getImages(url, true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [page, hasMore, getImages]);

  const RenderGallery = () => {
    return (
      <InfiniteScroll
        pageStart={0}
        loadMore={() => {}}
        hasMore={hasMore}
        loader={<div key={0} className="loader"></div>}
        useWindow={false}
        className="infinite-scroll-container"
      >
        {images.map((image, idx) => (
          <img
            key={idx}
            src={image.urls.regular}
            alt={image.alt_description}
            loading="lazy"
          />
        ))}
      </InfiniteScroll>
    );
  };

  return (
    <div className="container">
      <div className="search">
        <input
          type="text"
          placeholder="Searching..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            inputRef.current = e.target.value;
          }}
          onKeyDown={handleEnter}
        />
        <button type="submit" onClick={handleSearch} disabled={!input}>
          Search
        </button>
      </div>
      <div className="gallery">
        <RenderGallery />
      </div>
    </div>
  );
};

export default App;

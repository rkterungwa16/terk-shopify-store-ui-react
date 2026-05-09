import React, { useMemo } from "react";
import "./styles.css";

type MediaType = "image" | "video" | "none";

interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt?: string;
}

interface VideoAsset {
  src: string;
}

interface HeroProps {
  id: string;
  index?: number;

  settings: {
    // desktop
    media_type_1: MediaType;
    media_type_2: MediaType;
    image_1?: ImageAsset;
    image_2?: ImageAsset;
    video_1?: VideoAsset;
    video_2?: VideoAsset;

    // mobile
    custom_mobile_media: boolean;
    stack_media_on_mobile: boolean;

    media_type_1_mobile?: MediaType;
    media_type_2_mobile?: MediaType;
    image_1_mobile?: ImageAsset;
    image_2_mobile?: ImageAsset;
    video_1_mobile?: VideoAsset;
    video_2_mobile?: VideoAsset;

    // layout
    section_height: string;
    section_height_custom?: number;

    blurred_reflection?: boolean;

    link?: string;
    open_in_new_tab?: boolean;

    color_scheme?: string;
  };

  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({ id, settings, children, index = 2 }) => {
  const {
    media_type_1,
    media_type_2,
    image_1,
    image_2,
    video_1,
    video_2,

    custom_mobile_media,
    stack_media_on_mobile,

    media_type_1_mobile,
    media_type_2_mobile,
    image_1_mobile,
    image_2_mobile,
    video_1_mobile,
    video_2_mobile,

    blurred_reflection,
    link,
    open_in_new_tab,
    color_scheme,
  } = settings;

  /**
   * =========================
   * DERIVED STATE (Liquid → JS)
   * =========================
   */
  const derived = useMemo(() => {
    let media_1: MediaType = "none";
    let media_2: MediaType = "none";
    let media_1_mobile: MediaType = "none";
    let media_2_mobile: MediaType = "none";

    let media_count = 0;
    let media_count_mobile = 0;

    // Desktop
    if (image_1 && media_type_1 === "image") {
      media_1 = "image";
      media_count++;
    }
    if (video_1 && media_type_1 === "video") {
      media_1 = "video";
      media_count++;
    }

    if (image_2 && media_type_2 === "image") {
      media_2 = "image";
      media_count++;
    }
    if (video_2 && media_type_2 === "video") {
      media_2 = "video";
      media_count++;
    }

    // Mobile
    if (custom_mobile_media) {
      if (image_1_mobile && media_type_1_mobile === "image") {
        media_1_mobile = "image";
        media_count_mobile++;
      }
      if (video_1_mobile && media_type_1_mobile === "video") {
        media_1_mobile = "video";
        media_count_mobile++;
      }

      if (image_2_mobile && media_type_2_mobile === "image") {
        media_2_mobile = "image";
        media_count_mobile++;
      }
      if (video_2_mobile && media_type_2_mobile === "video") {
        media_2_mobile = "video";
        media_count_mobile++;
      }
    }

    const has_only_video =
      media_count > 0 && media_1 !== "image" && media_2 !== "image";

    const has_only_video_mobile =
      media_count_mobile > 0 &&
      media_1_mobile !== "image" &&
      media_2_mobile !== "image";

    const fallback_to_desktop =
      !custom_mobile_media || media_count_mobile === 0 || media_count === 0;

    const final_mobile_count = fallback_to_desktop
      ? media_count
      : media_count_mobile;

    return {
      media_1,
      media_2,
      media_1_mobile,
      media_2_mobile,
      media_count,
      media_count_mobile: final_mobile_count,
      has_only_video,
      has_only_video_mobile,
      fallback_to_desktop,
    };
  }, [settings]);

  /**
   * =========================
   * RENDER HELPERS
   * =========================
   */

  const renderImage = (img?: ImageAsset, testId?: string) => {
    if (!img) return null;

    return (
      <img
        src={img.src}
        width={img.width}
        height={img.height}
        alt={img.alt || ""}
        className="hero__media"
        data-testid={testId}
        loading={index === 1 ? "eager" : "lazy"}
      />
    );
  };

  const renderVideo = (vid?: VideoAsset, testId?: string) => {
    if (!vid) return null;

    return (
      <video
        src={vid.src}
        autoPlay
        loop
        muted
        playsInline
        className="hero__media"
        data-testid={testId}
      />
    );
  };

  /**
   * =========================
   * MEDIA SLOTS
   * =========================
   */

  const renderSlot1 = () => {
    if (derived.media_1 === "image") {
      return (
        <div className="hero__media-wrapper hero__media-wrapper--desktop">
          {renderImage(image_1, "hero-desktop-image-1")}
        </div>
      );
    }

    if (derived.media_1 === "video") {
      return (
        <div className="hero__media-wrapper hero__media-wrapper--desktop">
          {renderVideo(video_1, "hero-desktop-video-1")}
        </div>
      );
    }

    return null;
  };

  const renderSlot2 = () => {
    if (derived.media_2 === "image") {
      return (
        <div className="hero__media-wrapper hero__media-wrapper--desktop">
          {renderImage(image_2, "hero-desktop-image-2")}
        </div>
      );
    }

    if (derived.media_2 === "video") {
      return (
        <div className="hero__media-wrapper hero__media-wrapper--desktop">
          {renderVideo(video_2, "hero-desktop-video-2")}
        </div>
      );
    }

    return null;
  };

  /**
   * =========================
   * MAIN RENDER
   * =========================
   */

  return (
    <div
      id={`Hero-${id}`}
      className={`hero color-${color_scheme || "default"} ${
        stack_media_on_mobile ? "hero--stack-mobile" : ""
      }`}
      data-blur-shadow={
        blurred_reflection && !derived.has_only_video ? "true" : undefined
      }
    >
      <div className="hero__container section section--full-width">
        {link && (
          <a
            href={link}
            className="hero__link"
            target={open_in_new_tab ? "_blank" : undefined}
            rel={open_in_new_tab ? "noopener" : undefined}
          />
        )}

        <div
          className="hero__media-grid"
          style={
            {
              "--hero-media-count": derived.media_count,
              "--hero-media-count-mobile": derived.media_count_mobile,
            } as React.CSSProperties
          }
        >
          {renderSlot1()}
          {renderSlot2()}

          {derived.media_count === 0 && (
            <div className="hero__media placeholder" />
          )}
        </div>

        <div className="hero__content-wrapper">{children}</div>
      </div>
    </div>
  );
};

export default Hero;

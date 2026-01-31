import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AspectRatioVideo from "@/components/ui/videos/AspectRatioVideo";
import OneIsToOne from "@/components/ui/videos/OneIsToOne";
import SixteenIsToNine from "@/components/ui/videos/SixteenIsToNine";
import TwentyOneIsToNine from "@/components/ui/videos/TwentyOneIsToNine";
import React from "react";

export default function VideoPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Videos" />
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title="Video Ratio 16:9">
            <SixteenIsToNine />
          </ComponentCard>
          <ComponentCard title="Video Ratio 4:3">
            <AspectRatioVideo
              videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
              aspectRatio="4/3"
              title="Video Ratio 4:3"
            />
          </ComponentCard>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title="Video Ratio 21:9">
            <TwentyOneIsToNine />
          </ComponentCard>
          <ComponentCard title="Video Ratio 1:1">
            <OneIsToOne />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}

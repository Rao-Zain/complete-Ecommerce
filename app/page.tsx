import Image from "next/image";
import Hero from "./Hero/page"
import Bestselling from "./Bestselling/page"
import Banner from "./Banner/page"
import Featured from "./Featured/page"
import Special from "./Special/page"
import Brands from "./Brands/page"
import Official from "./Official/page"
import Handpicked from "./Handpicked/page"
import Services from "./Services/page"
import FlashSales from "./Flash Sales/page"
export default function Home() {

  return (
    <>
      <div className="bg-gray-50">
        <Hero />
        <FlashSales />
        <Services />
        <Bestselling />
        <Banner />
        <Featured />

        <Special />

        <Brands />


        <Official />

        <Handpicked />

      </div>
    </>

  );
}

import Image from "next/image";
import Hero from "./Hero/page"
import Bestselling from "./Bestselling/page"
import Banner from "./Banner/page"
import Featured from "./Featured/page"
import Special from "./Special/page"
import Brands from "./Brands/page"
import Official from "./Official/page"
import Handpicked from "./Handpicked/page"
export default function Home() {
  return (
    <>
    <div className="bg-gray-50">
     <Hero />
    
 
  <Bestselling />
  <Banner />
  <Featured />
  
  <Special />

  <Brands/>


  <Official />
 
 <Handpicked />

 </div>
  </>

  );
}

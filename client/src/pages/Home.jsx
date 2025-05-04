import Hero from "../components/home/Hero";
// import StorySection from '../components/home/StorySection';
// import JournerySection from '../components/home/JourneySection';
import MembershipSection from "../components/home/MembershipSection";
import FAQSection from "../components/home/FAQSection";
import HealthspanOptions from "../components/home/HealthspanOptions";
import AboutSection from "../components/home/AboutSection";
const Home = () => {
  return (
    <div>
      <Hero />
      <AboutSection />
      <HealthspanOptions />
      {/* <StorySection /> */}
      {/* <JournerySection/> */}
      <MembershipSection />
      <FAQSection />
    </div>
  );
};

export default Home;

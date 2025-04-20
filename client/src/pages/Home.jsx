import Hero from '../components/home/Hero';
// import StorySection from '../components/home/StorySection';
// import JournerySection from '../components/home/JourneySection';
import MembershipSection from '../components/home/MembershipSection';
import FAQSection from '../components/home/FAQSection';
import HealthspanOptions from '../components/home/HealthspanOptions';

const Home = () => {
  return (
    <div>
      <Hero />
      <HealthspanOptions />
      {/* <StorySection /> */}
      {/* <JournerySection/> */}
      <MembershipSection />
      <FAQSection />
    </div>
  )
}

export default Home

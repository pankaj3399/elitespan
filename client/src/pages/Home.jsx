import Hero from '../components/home/Hero'; 
import StorySection from '../components/home/StorySection';
import JournerySection from '../components/home/JourneySection';
import MembershipSection from '../components/home/MembershipSection';
import FAQSection from '../components/home/FAQSection';

const Home = () => {
  return (
    <div>
      <Hero />
      <StorySection />
      <JournerySection/>
      <MembershipSection />
      <FAQSection/>
    </div>
  )
}

export default Home

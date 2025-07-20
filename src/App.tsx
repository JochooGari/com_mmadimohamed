import { ContentProvider } from "./context/ContentContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Expertise from "./components/Expertise";
import Blog from "./components/Blog";
import Resources from "./components/Resources";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <ContentProvider>
      <Header />
      <Hero />
      <Expertise />
      <Blog />
      <Resources />
      <Contact />
      <Footer />
    </ContentProvider>
  );
}

export default App;
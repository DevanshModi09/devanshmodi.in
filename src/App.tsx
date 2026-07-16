import { Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { site } from './config';
import About from './pages/About';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PostPage from './pages/PostPage';
import Projects from './pages/Projects';

export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="content">
        <div className="content-inner">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:slug" element={<PostPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <footer className="site-footer">
            <p>
              © {site.year} {site.author.name}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

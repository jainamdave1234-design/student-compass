import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Student Compass | AI-Powered Career Guidance & Learning Roadmaps',
  description: 'Discover your ideal engineering and tech career path. Perform dynamic skill gap assessments, explore interactive learning roadmaps, and track your progress with hands-on projects and courses.',
  keywords: 'career guidance, learning roadmaps, engineering career match, technical skills assessment, student roadmap, skill gap analysis',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <footer style={{
          padding: '24px 0',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--color-text-dark)',
          background: 'rgba(6, 8, 19, 0.4)',
          marginTop: 'auto'
        }}>
          <div className="container">
            <p>&copy; 2026 Student Compass Career Guidance System. Actionable engineering paths for success.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

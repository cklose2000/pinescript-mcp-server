import '@/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PineScript MCP - Strategy Analysis & Optimization',
  description: 'Analyze and optimize your PineScript trading strategies with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-primary-700 text-white">
            <div className="container mx-auto px-4 py-4 flex-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold m-0">PineScript MCP</h1>
                <nav>
                  <ul className="flex space-x-6">
                    <li><a href="/" className="hover:text-primary-200">Dashboard</a></li>
                    <li><a href="/strategies" className="hover:text-primary-200">Strategies</a></li>
                    <li><a href="/templates" className="hover:text-primary-200">Templates</a></li>
                    <li><a href="/analyze" className="hover:text-primary-200">Analysis</a></li>
                  </ul>
                </nav>
              </div>
              <div>
                <button className="btn btn-secondary">Login</button>
              </div>
            </div>
          </header>
          
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="bg-secondary-800 text-white py-6">
            <div className="container mx-auto px-4 flex-between">
              <div>
                <p className="m-0">© 2025 PineScript MCP Project</p>
              </div>
              <div>
                <ul className="flex space-x-4">
                  <li><a href="/docs" className="hover:text-primary-300">Documentation</a></li>
                  <li><a href="/about" className="hover:text-primary-300">About</a></li>
                  <li><a href="/contact" className="hover:text-primary-300">Contact</a></li>
                </ul>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 
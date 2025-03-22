import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Analyze and Optimize Trading Strategies with AI</h1>
          <p className="text-xl mb-6">
            Leverage the power of AI to analyze PineScript trading strategies,
            identify weaknesses, and generate optimized solutions.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/analyze" className="btn btn-primary bg-white text-primary-700 hover:bg-primary-50">
              Start Analysis
            </Link>
            <Link href="/docs" className="btn btn-secondary bg-primary-600 text-white hover:bg-primary-500">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Strategy Analysis</h2>
          <p>
            Get comprehensive analysis of your trading strategies including parameter evaluation, 
            logic assessment, and risk management insights.
          </p>
          <Link href="/analyze" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
            Start Analyzing
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Template Management</h2>
          <p>
            Browse and manage templates for different analysis types. Use specialized templates
            for strategy analysis, backtest interpretation, and optimization.
          </p>
          <Link href="/templates" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
            Explore Templates
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Strategy Optimization</h2>
          <p>
            Receive AI-powered suggestions for improving your strategies, optimizing parameters,
            and enhancing risk management approaches.
          </p>
          <Link href="/optimize" className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center">
            Optimize Strategies
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="bg-secondary-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Recent Updates</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex-between">
              <h3 className="text-lg font-semibold m-0">Enhanced Template System</h3>
              <span className="text-sm text-secondary-500">2 days ago</span>
            </div>
            <p className="m-0">
              We've implemented a new template system with standardized sections, validation,
              and vector search capabilities.
            </p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex-between">
              <h3 className="text-lg font-semibold m-0">Anthropic Provider Integration</h3>
              <span className="text-sm text-secondary-500">1 week ago</span>
            </div>
            <p className="m-0">
              Added support for Claude models with model-specific configurations.
            </p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex-between">
              <h3 className="text-lg font-semibold m-0">Template CLI Commands</h3>
              <span className="text-sm text-secondary-500">2 weeks ago</span>
            </div>
            <p className="m-0">
              Added CLI commands for template management, search, and synchronization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 